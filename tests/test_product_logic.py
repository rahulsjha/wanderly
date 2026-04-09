from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
MOCK_DATA_PATH = ROOT / "data" / "mock_data.json"


def load_mock_data() -> dict:
    return json.loads(MOCK_DATA_PATH.read_text(encoding="utf-8"))

def minutes_from_12_hour(h: int, m: int, ampm: str) -> int:
    hh = h % 12
    hour24 = hh + 12 if ampm.upper() == "PM" else hh
    return hour24 * 60 + m


def parse_time_token(token: str) -> int | None:
    match = re.search(r"(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)", token.strip(), re.IGNORECASE)
    if not match:
        return None
    hh = int(match.group(1))
    mm = int(match.group(2))
    ampm = match.group(3).upper()
    return minutes_from_12_hour(hh, mm, ampm)


def is_within_range(now_min: int, start_min: int, end_min: int) -> bool:
    if start_min == end_min:
        return True
    if end_min > start_min:
        return start_min <= now_min <= end_min
    return now_min >= start_min or now_min <= end_min


def open_now_status_spec(opening_hours: str, now: datetime) -> str:
    raw = opening_hours.strip()
    lower = raw.lower()

    if not raw:
        return "unknown"
    if "open 24 hours" in lower:
        return "open"
    if "shows at" in lower:
        return "unknown"

    now_min = now.hour * 60 + now.minute
    segments = [s.strip() for s in raw.split(",") if s.strip()]
    any_parsed = False

    for seg in segments:
        parts = seg.split("-")
        if len(parts) != 2:
            continue
        start = parse_time_token(parts[0])
        end = parse_time_token(parts[1])
        if start is None or end is None:
            continue
        any_parsed = True
        if is_within_range(now_min, start, end):
            return "open"

    return "closed" if any_parsed else "unknown"


@dataclass
class TimelineRow:
    id: str
    start_min: int
    end_min: int
    duration_min: int
    travel_gap_before: int | None


def build_timeline_spec(
    place_ids: list[str],
    durations_by_id: dict[str, int],
    start_min: int = 9 * 60,
    travel_gap_min: int = 15,
) -> tuple[list[TimelineRow], int, int]:
    cursor = start_min
    rows: list[TimelineRow] = []

    for idx, place_id in enumerate(place_ids):
        if idx > 0:
            cursor += travel_gap_min
        duration = durations_by_id.get(place_id, 45)
        row_start = cursor
        row_end = cursor + duration
        rows.append(
            TimelineRow(
                id=place_id,
                start_min=row_start,
                end_min=row_end,
                duration_min=duration,
                travel_gap_before=None if idx == 0 else travel_gap_min,
            )
        )
        cursor = row_end

    total_duration = cursor - start_min
    return rows, total_duration, cursor



def test_mock_data_shape_and_uniqueness() -> None:
    data = load_mock_data()
    places = data["places"]

    assert isinstance(places, list)
    assert places, "mock places must not be empty"

    ids = [p["id"] for p in places]
    assert len(ids) == len(set(ids)), "place ids must be unique"

    for place in places:
        assert place["name"].strip()
        assert place["estimated_duration_min"] > 0
        assert place["distance_km"] >= 0
        assert isinstance(place["tags"], list)


@pytest.mark.parametrize("category", ["landmark", "restaurant", "cafe", "activity", "shopping"])
def test_categories_are_within_supported_union(category: str) -> None:
    data = load_mock_data()
    place_categories = {p["category"] for p in data["places"]}
    assert category in place_categories


@pytest.mark.parametrize("price_level", ["Free", "$", "$$", "$$$", "$$$$"])
def test_price_levels_are_supported(price_level: str) -> None:
    data = load_mock_data()
    all_prices = {p["price_level"] for p in data["places"]}
    assert all_prices.issubset({"Free", "$", "$$", "$$$", "$$$$"})
    assert price_level in {"Free", "$", "$$", "$$$", "$$$$"}


def test_opening_hours_24h_and_unknown_cases() -> None:
    now = datetime(2026, 4, 9, 10, 30)
    assert open_now_status_spec("Open 24 hours", now) == "open"
    assert open_now_status_spec("Shows at 7 PM", now) == "unknown"
    assert open_now_status_spec("", now) == "unknown"


def test_opening_hours_multi_segment_range() -> None:
    assert (
        open_now_status_spec(
            "6:00 AM - 12:00 PM, 3:00 PM - 9:00 PM",
            datetime(2026, 4, 9, 11, 15),
        )
        == "open"
    )
    assert (
        open_now_status_spec(
            "6:00 AM - 12:00 PM, 3:00 PM - 9:00 PM",
            datetime(2026, 4, 9, 14, 0),
        )
        == "closed"
    )


def test_opening_hours_overnight_range() -> None:
    hours = "7:00 PM - 2:00 AM"
    assert open_now_status_spec(hours, datetime(2026, 4, 9, 23, 0)) == "open"
    assert open_now_status_spec(hours, datetime(2026, 4, 10, 1, 30)) == "open"
    assert open_now_status_spec(hours, datetime(2026, 4, 10, 10, 0)) == "closed"


def test_timeline_includes_gap_and_total_duration() -> None:
    rows, total_duration, end = build_timeline_spec(
        ["a", "b", "c"],
        {"a": 60, "b": 30, "c": 45},
        start_min=9 * 60,
        travel_gap_min=15,
    )

    assert rows[0].start_min == 540
    assert rows[1].start_min == 615  # 9:00 + 60 + 15
    assert rows[2].start_min == 660  # +30 + 15

    assert rows[0].travel_gap_before is None
    assert rows[1].travel_gap_before == 15
    assert rows[2].travel_gap_before == 15

    assert total_duration == (60 + 15 + 30 + 15 + 45)
    assert end == 540 + total_duration


def test_timeline_fallback_duration_for_missing_place() -> None:
    rows, total_duration, _ = build_timeline_spec(["known", "missing"], {"known": 20})
    assert rows[1].duration_min == 45
    assert total_duration == 20 + 15 + 45


def test_ten_hour_warning_threshold_logic() -> None:
    _, total_just_10h, _ = build_timeline_spec(["x"], {"x": 600}, travel_gap_min=0)
    _, total_over_10h, _ = build_timeline_spec(["x", "y"], {"x": 600, "y": 1}, travel_gap_min=0)

    assert total_just_10h == 600
    assert not (total_just_10h > 600)
    assert total_over_10h == 601
    assert total_over_10h > 600

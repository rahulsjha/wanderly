import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Wanderly } from '@/constants/wanderly-theme';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Wanderly ErrorBoundary]', error, info.componentStack);
  }

  private onRetry = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconGlyph}>⚠️</Text>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.desc}>The screen crashed unexpectedly. You can safely retry.</Text>
        {this.state.message ? <Text style={styles.message}>{this.state.message}</Text> : null}
        <Pressable
          style={styles.button}
          onPress={this.onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityHint="Attempts to recover the current screen"
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
    backgroundColor: Wanderly.colors.background,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  iconGlyph: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: Wanderly.colors.textMuted,
    textAlign: 'center',
    fontFamily: Wanderly.fonts.ui,
  },
  message: {
    marginTop: 4,
    fontSize: 12,
    color: Wanderly.colors.textMuted,
    textAlign: 'center',
    fontFamily: Wanderly.fonts.ui,
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
});

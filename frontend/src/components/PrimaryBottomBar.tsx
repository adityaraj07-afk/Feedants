import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { LifecyclePhase } from '../types';

interface Props {
  ctaText: string;
  ctaAction: 'REGISTER' | 'SUBMIT' | 'VIEW_SUBMISSION' | 'VIEW_WINNERS' | 'DISABLED';
  currentPhase: LifecyclePhase;
  isRegistered: boolean;
  hasSubmitted: boolean;
  spotsLeft: number;
  loading: boolean;
  onPress: () => void;
}

export const PrimaryBottomBar: React.FC<Props> = ({
  ctaText,
  ctaAction,
  currentPhase,
  isRegistered,
  hasSubmitted,
  spotsLeft,
  loading,
  onPress,
}) => {
  const isDisabled = ctaAction === 'DISABLED' || loading;

  const getButtonStyle = () => {
    switch (ctaAction) {
      case 'REGISTER':
        return styles.btnRegister;
      case 'SUBMIT':
        return styles.btnSubmit;
      case 'VIEW_SUBMISSION':
        return styles.btnViewSubmission;
      case 'VIEW_WINNERS':
        return styles.btnViewWinners;
      case 'DISABLED':
      default:
        if (isRegistered) {
          return styles.btnRegisteredDisabled;
        }
        return styles.btnDisabled;
    }
  };

  const getButtonTextStyle = () => {
    switch (ctaAction) {
      case 'REGISTER':
      case 'SUBMIT':
      case 'VIEW_WINNERS':
        return styles.btnTextWhite;
      case 'VIEW_SUBMISSION':
        return styles.btnTextViewSubmission;
      case 'DISABLED':
      default:
        if (isRegistered) {
          return styles.btnTextRegistered;
        }
        return styles.btnTextDisabled;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.baseButton, getButtonStyle()]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={[styles.baseButtonText, getButtonTextStyle()]}>{ctaText}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0C111E',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  baseButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  baseButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnRegister: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSubmit: {
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnViewSubmission: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.emerald,
  },
  btnViewWinners: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRegisteredDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  btnDisabled: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnTextWhite: {
    color: '#FFFFFF',
  },
  btnTextViewSubmission: {
    color: colors.emeraldLight,
  },
  btnTextRegistered: {
    color: colors.emeraldLight,
  },
  btnTextDisabled: {
    color: colors.textMuted,
  },
});

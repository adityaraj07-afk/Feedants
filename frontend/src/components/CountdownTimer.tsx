import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  targetDateString: string | null;
  label: string;
  serverTimeString?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

export const CountdownTimer: React.FC<Props> = ({ targetDateString, label, serverTimeString }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    if (!targetDateString) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
      return;
    }

    const targetTime = new Date(targetDateString).getTime();

    // Calculate initial clock skew offset between client and server
    const serverTimestamp = serverTimeString ? new Date(serverTimeString).getTime() : Date.now();
    const clockSkewOffset = serverTimestamp - Date.now();

    const calculateTime = () => {
      const currentSimulatedServerTime = Date.now() + clockSkewOffset;
      const difference = targetTime - currentSimulatedServerTime;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDateString, serverTimeString]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconPulseWrapper}>
          <Text style={styles.timerIcon}>⏳</Text>
        </View>
        <Text style={styles.label}>{label || 'Registration Deadline'}</Text>
        <View style={styles.serverSyncBadge}>
          <Text style={styles.serverSyncText}>Server Synced</Text>
        </View>
      </View>

      {timeRemaining.isEnded ? (
        <View style={styles.endedContainer}>
          <Text style={styles.endedText}>Time has expired for this phase</Text>
        </View>
      ) : (
        <View style={styles.timerRow}>
          {/* Days */}
          <View style={styles.timeUnit}>
            <View style={styles.digitBox}>
              <Text style={styles.digit}>{pad(timeRemaining.days)}</Text>
            </View>
            <Text style={styles.unitLabel}>DAYS</Text>
          </View>

          <Text style={styles.separator}>:</Text>

          {/* Hours */}
          <View style={styles.timeUnit}>
            <View style={styles.digitBox}>
              <Text style={styles.digit}>{pad(timeRemaining.hours)}</Text>
            </View>
            <Text style={styles.unitLabel}>HOURS</Text>
          </View>

          <Text style={styles.separator}>:</Text>

          {/* Minutes */}
          <View style={styles.timeUnit}>
            <View style={styles.digitBox}>
              <Text style={styles.digit}>{pad(timeRemaining.minutes)}</Text>
            </View>
            <Text style={styles.unitLabel}>MINS</Text>
          </View>

          <Text style={styles.separator}>:</Text>

          {/* Seconds */}
          <View style={styles.timeUnit}>
            <View style={[styles.digitBox, styles.digitBoxActive]}>
              <Text style={[styles.digit, styles.digitActive]}>{pad(timeRemaining.seconds)}</Text>
            </View>
            <Text style={[styles.unitLabel, styles.unitLabelActive]}>SECS</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconPulseWrapper: {
    marginRight: 6,
  },
  timerIcon: {
    fontSize: 14,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  serverSyncBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  serverSyncText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '600',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeUnit: {
    alignItems: 'center',
    flex: 1,
  },
  digitBox: {
    backgroundColor: colors.surfaceElevated,
    width: '90%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  digitBoxActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  digit: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  digitActive: {
    color: colors.primaryLight,
  },
  unitLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  unitLabelActive: {
    color: colors.primaryLight,
  },
  separator: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  endedContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  endedText: {
    color: colors.roseLight,
    fontSize: 13,
    fontWeight: '600',
  },
});

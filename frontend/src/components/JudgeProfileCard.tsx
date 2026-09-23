import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { IJudge } from '../types';

interface Props {
  judge: IJudge;
}

export const JudgeProfileCard: React.FC<Props> = ({ judge }) => {
  const [showBioModal, setShowBioModal] = useState(false);

  const handleOpenVideo = () => {
    if (judge.introVideoUrl) {
      Linking.openURL(judge.introVideoUrl).catch((err) => {
        console.warn('Could not open video URL:', err);
      });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.pillJudge}>
          <Text style={styles.pillText}>OFFICIAL HEAD JUDGE</Text>
        </View>
      </View>

      <View style={styles.profileRow}>
        {/* Judge Avatar with accent border */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: judge.avatarUrl }} style={styles.avatar} />
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedCheck}>✓</Text>
          </View>
        </View>

        {/* Judge Info */}
        <View style={styles.infoCol}>
          <Text style={styles.name}>{judge.name}</Text>
          <Text style={styles.title}>{judge.title}</Text>

          {/* Intro Video CTA */}
          <TouchableOpacity style={styles.videoButton} onPress={handleOpenVideo} activeOpacity={0.8}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.videoButtonText}>Watch Judge Intro Video</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio excerpt */}
      <View style={styles.bioContainer}>
        <Text style={styles.bioText} numberOfLines={3}>
          "{judge.bio}"
        </Text>
      </View>
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
    borderColor: colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pillJudge: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  pillText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.emerald,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  playIcon: {
    color: colors.roseLight,
    fontSize: 10,
    marginRight: 6,
  },
  videoButtonText: {
    color: colors.roseLight,
    fontSize: 11,
    fontWeight: '700',
  },
  bioContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bioText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  title: string;
  bannerUrl: string;
  categoryTags: string[];
  hasCertificate: boolean;
  isRegistered: boolean;
  registrationCode?: string;
  currentPhase?: string;
}

export const HeaderHero: React.FC<Props> = ({
  title,
  bannerUrl,
  categoryTags,
  hasCertificate,
  isRegistered,
  registrationCode,
  currentPhase,
}) => {
  return (
    <View style={styles.container}>
      {/* Banner Image with dark gradient overlay */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: bannerUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />
      </View>

      {/* Hero Content */}
      <View style={styles.content}>
        {/* Top Badges Row: Categories + Certificate + Status Pill */}
        <View style={styles.metaRow}>
          {/* Category Tags */}
          <View style={styles.tagsGroup}>
            {categoryTags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Registration Status Pill */}
          <View
            style={[
              styles.statusPill,
              isRegistered ? styles.statusPillRegistered : styles.statusPillNotRegistered,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isRegistered ? colors.emerald : colors.textMuted },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isRegistered ? colors.emeraldLight : colors.textSecondary },
              ]}
            >
              {isRegistered ? 'Registered' : 'Not Registered'}
            </Text>
          </View>
        </View>

        {/* Certificate Badge */}
        {hasCertificate && (
          <View style={styles.certBadge}>
            <Text style={styles.certIcon}>🎖️</Text>
            <Text style={styles.certText}>Winners get verifiable certificate</Text>
          </View>
        )}

        {/* Competition Title */}
        <Text style={styles.title}>{title}</Text>

        {/* If user is registered, show their Registration ID */}
        {isRegistered && registrationCode && (
          <View style={styles.registrationPass}>
            <Text style={styles.registrationPassLabel}>YOUR PASS ID:</Text>
            <Text style={styles.registrationPassCode}>{registrationCode}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  bannerContainer: {
    width: '100%',
    height: 210,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 13, 22, 0.72)',
  },
  content: {
    marginTop: -70,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillRegistered: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: colors.emerald,
  },
  statusPillNotRegistered: {
    backgroundColor: 'rgba(100, 116, 139, 0.18)',
    borderColor: colors.borderHighlight,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 12,
  },
  certIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  certText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  registrationPass: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  registrationPassLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },
  registrationPassCode: {
    color: colors.emeraldLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

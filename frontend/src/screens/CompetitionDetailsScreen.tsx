import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { ICompetition, IUser, IWinner, IReferralData } from '../types';
import { DemoControlBar } from '../components/DemoControlBar';
import { HeaderHero } from '../components/HeaderHero';
import { PrizeAndSpotsCard } from '../components/PrizeAndSpotsCard';
import { CountdownTimer } from '../components/CountdownTimer';
import { JudgeProfileCard } from '../components/JudgeProfileCard';
import { ImportantDatesBlock } from '../components/ImportantDatesBlock';
import { PreviousWinnersList } from '../components/PreviousWinnersList';
import { TabbedContent } from '../components/TabbedContent';
import { RewardsTable } from '../components/RewardsTable';
import { ReferralBlock } from '../components/ReferralBlock';
import { PrimaryBottomBar } from '../components/PrimaryBottomBar';
import { SubmissionModal } from '../components/SubmissionModal';

export const CompetitionDetailsScreen: React.FC = () => {
  const [competition, setCompetition] = useState<ICompetition | null>(null);
  const [competitionsList, setCompetitionsList] = useState<ICompetition[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('urban-dance-showdown-2026');

  const [users, setUsers] = useState<IUser[]>([]);
  const [activeUser, setActiveUser] = useState<IUser | null>(null);

  const [winners, setWinners] = useState<IWinner[]>([]);
  const [referralData, setReferralData] = useState<IReferralData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Initial load: Fetch available users and competitions
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [usersRes, compsRes] = await Promise.all([api.getUsers(), api.getCompetitions()]);

        setUsers(usersRes.users || []);
        if (usersRes.users && usersRes.users.length > 0) {
          // Default to first user (Alex Morgan)
          setActiveUser(usersRes.users[0]);
        }

        setCompetitionsList(compsRes.competitions || []);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError('Could not connect to backend server. Make sure the API is running at localhost:5000.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Whenever activeSlug or activeUser changes, fetch full competition details
  useEffect(() => {
    if (!activeSlug) return;
    loadCompetitionDetails();
  }, [activeSlug, activeUser]);

  const loadCompetitionDetails = async () => {
    try {
      setError(null);
      const userId = activeUser?._id;
      const res = await api.getCompetitionById(activeSlug, userId);
      setCompetition(res.competition);

      // Concurrently fetch winners and referral info
      const [winnersRes, refRes] = await Promise.all([
        api.getCompetitionWinners(activeSlug).catch(() => ({ winners: [] })),
        userId ? api.getReferralDetails(activeSlug, userId).catch(() => null) : Promise.resolve(null),
      ]);

      setWinners(winnersRes.winners || []);
      setReferralData(refRes);
    } catch (err: any) {
      console.error('Error fetching competition details:', err);
      setError(err.message || 'Failed to load competition details');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCompetitionDetails();
    setRefreshing(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Primary CTA Button handler
  const handlePrimaryCta = async () => {
    if (!competition || !activeUser) return;

    if (competition.ctaAction === 'REGISTER') {
      try {
        setActionLoading(true);
        const regRes = await api.registerForCompetition(competition.slug, activeUser._id);
        showToast(`🎉 ${regRes.message}`);
        await loadCompetitionDetails();
      } catch (err: any) {
        Alert.alert('Registration Failed', err.message);
      } finally {
        setActionLoading(false);
      }
    } else if (competition.ctaAction === 'SUBMIT' || competition.ctaAction === 'VIEW_SUBMISSION') {
      setSubmissionModalVisible(true);
    } else if (competition.ctaAction === 'VIEW_WINNERS') {
      showToast('🏆 Winners announced! Scroll below to view the Hall of Fame.');
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  // Project Submission handler
  const handleSubmissionSubmit = async (data: { title: string; description: string; mediaUrl: string }) => {
    if (!competition || !activeUser) return;
    await api.submitProject(competition.slug, activeUser._id, data);
    showToast('🚀 Project performance submitted successfully!');
    await loadCompetitionDetails();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Competition Details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !competition) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Connection Issue</Text>
        <Text style={styles.errorMessage}>{error || 'Competition details not available.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCompetitionDetails}>
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1523" />

      {/* Interactive Switcher Top Bar for Demoing */}
      <DemoControlBar
        users={users}
        activeUser={activeUser}
        onSelectUser={(u) => setActiveUser(u)}
        competitions={competitionsList}
        activeCompetitionSlug={activeSlug}
        onSelectCompetition={(slug) => setActiveSlug(slug)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Main Scrollable View */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Hero with title, category tags, certificate badge, and registration status pill */}
        <HeaderHero
          title={competition.title}
          bannerUrl={competition.bannerUrl}
          categoryTags={competition.categoryTags}
          hasCertificate={competition.hasCertificate}
          isRegistered={competition.isRegistered}
          registrationCode={competition.registrationDetails?.registrationCode}
          currentPhase={competition.currentPhase}
        />

        {/* 2. Prize pool, entry fee, live "spots left" counter with animated progress bar */}
        <PrizeAndSpotsCard
          totalPrize={competition.prizePool.total}
          currency={competition.prizePool.currency}
          entryFee={competition.entryFee}
          capacity={competition.capacity}
          spotsLeft={competition.spotsLeft}
          isSpotsFull={competition.isSpotsFull}
        />

        {/* 3. Live countdown timer to the registration deadline (server timestamp synced) */}
        <CountdownTimer
          targetDateString={competition.nextDeadline}
          label={competition.nextDeadlineLabel}
          serverTimeString={competition.serverTime}
        />

        {/* 4. Judge/host profile card with name, title, bio, and intro video */}
        <JudgeProfileCard judge={competition.judge} />

        {/* 5. Important Dates block: register-by, submission-start, submission-end, result date */}
        <ImportantDatesBlock timeline={competition.timeline} currentPhase={competition.currentPhase} />

        {/* 6. Previous Winners horizontal list */}
        <PreviousWinnersList winners={winners} />

        {/* 7. Tabbed content: About Competition / Judging Parameters / Rules & Eligibility */}
        <TabbedContent tabsContent={competition.tabsContent} />

        {/* 8. Rewards table by position (1st–6th place, etc.) */}
        <RewardsTable breakdown={competition.prizePool.breakdown} currency={competition.prizePool.currency} />

        {/* 9. Referral link block (generate/share unique referral code per user) */}
        <ReferralBlock referralData={referralData} userName={activeUser?.name || 'Creator'} />
      </ScrollView>

      {/* 10. Sticky Primary CTA Button changing based on state */}
      <PrimaryBottomBar
        ctaText={competition.ctaText}
        ctaAction={competition.ctaAction}
        currentPhase={competition.currentPhase}
        isRegistered={competition.isRegistered}
        hasSubmitted={competition.hasSubmitted}
        spotsLeft={competition.spotsLeft}
        loading={actionLoading}
        onPress={handlePrimaryCta}
      />

      {/* Submission Modal for uploading routine title, description, and media link */}
      <SubmissionModal
        visible={submissionModalVisible}
        onClose={() => setSubmissionModalVisible(false)}
        onSubmit={handleSubmissionSubmit}
        existingSubmission={competition.submissionDetails}
        competitionTitle={competition.title}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  toastContainer: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});

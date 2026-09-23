import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { ISubmission } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; mediaUrl: string }) => Promise<void>;
  existingSubmission: ISubmission | null;
  competitionTitle: string;
}

export const SubmissionModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  existingSubmission,
  competitionTitle,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (existingSubmission) {
      setTitle(existingSubmission.title || '');
      setDescription(existingSubmission.description || '');
      setMediaUrl(existingSubmission.mediaUrl || '');
    } else {
      setTitle('');
      setDescription('');
      setMediaUrl('');
    }
    setErrorMsg(null);
  }, [existingSubmission, visible]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a submission title.');
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMsg('Please enter a valid media / video link.');
      return;
    }
    try {
      new URL(mediaUrl.trim());
    } catch {
      setErrorMsg('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        mediaUrl: mediaUrl.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>
                {existingSubmission ? 'Edit Your Submission' : 'Submit Your Performance'}
              </Text>
              <Text style={styles.modalSub} numberOfLines={1}>
                {competitionTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Routine / Project Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Cyber Rhythm Freestyle Solo"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Media URL Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Video / Demo URL (YouTube, Vimeo, Drive) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={colors.textMuted}
                value={mediaUrl}
                onChangeText={setMediaUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.inputHelper}>
                Provide an unlisted or public YouTube link, Vimeo, or Google Drive link with viewing access enabled.
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choreography Notes / Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your song selection, themes, freestyle elements, or inspiration..."
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Terms checkbox / note */}
            <View style={styles.termsNote}>
              <Text style={styles.termsText}>
                By submitting, you confirm that this routine is your original work and meets all competition rules and guidelines.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {existingSubmission ? 'Update Submission' : 'Submit Performance 🚀'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    maxWidth: 260,
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  formScroll: {
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.rose,
  },
  errorText: {
    color: colors.roseLight,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHelper: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  termsNote: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

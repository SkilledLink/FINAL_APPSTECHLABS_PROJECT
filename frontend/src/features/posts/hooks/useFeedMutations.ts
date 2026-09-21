import { useCallback, useState } from 'react';
import { postApi } from '../api/feedApi';
import type {
  Post,
  PostCreatePayload,
  PostUpdatePayload,
  PostComment,
  PostCommentCreatePayload,
  PostMedia,
} from '../types/post.types';

type ApiError = {
  response?: {
    data?: {
      detail?: string;
    };
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const detail = (error as ApiError).response?.data?.detail;
    if (detail) return detail;
  }
  return fallback;
}

export function useFeedMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Create ─────────────────────────────────────────────
  const createPost = useCallback(
    async (payload: PostCreatePayload): Promise<Post> => {
      setLoading(true);
      setError(null);
      try {
        return await postApi.create(payload);
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Failed to create post');
        setError(msg);
        throw new Error(msg, { cause: err });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Update ─────────────────────────────────────────────
  const updatePost = useCallback(
    async (postId: string, payload: PostUpdatePayload): Promise<Post> => {
      setLoading(true);
      setError(null);
      try {
        return await postApi.update(postId, payload);
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Failed to update post');
        setError(msg);
        throw new Error(msg, { cause: err });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Delete ─────────────────────────────────────────────
  const deletePost = useCallback(async (postId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await postApi.delete(postId);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to delete post');
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Like ───────────────────────────────────────────────
  const toggleLike = useCallback(async (postId: string) => {
    try {
      return await postApi.toggleLike(postId);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to toggle like');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  }, []);

  // ─── Media ──────────────────────────────────────────────
  const uploadMedia = useCallback(
    async (postId: string, file: File): Promise<PostMedia> => {
      try {
        return await postApi.uploadMedia(postId, file);
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Failed to upload media');
        setError(msg);
        throw new Error(msg, { cause: err });
      }
    },
    []
  );

  const deleteMedia = useCallback(async (mediaId: string): Promise<void> => {
    try {
      await postApi.deleteMedia(mediaId);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to delete media');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  }, []);

  // ─── Comments ───────────────────────────────────────────
  const createComment = useCallback(
    async (
      postId: string,
      payload: PostCommentCreatePayload
    ): Promise<PostComment> => {
      try {
        return await postApi.createComment(postId, payload);
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Failed to create comment');
        setError(msg);
        throw new Error(msg, { cause: err });
      }
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      await postApi.deleteComment(commentId);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to delete comment');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  }, []);

  return {
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    uploadMedia,
    deleteMedia,
    createComment,
    deleteComment,
    // Aliases for convenience
    createFeed: createPost,
    updateFeed: updatePost,
    deleteFeed: deletePost,
  };
}
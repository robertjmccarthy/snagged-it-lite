import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import { 
  uploadSnagPhoto, 
  createSnag, 
  getUserProgress, 
  updateUserProgress 
} from '@/lib/api/checklist';

// Mock the supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn()
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      getPublicUrl: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis()
  }
}));

// Mock the debug module
vi.mock('@/lib/debug', () => ({
  debug: {
    log: vi.fn(),
    error: vi.fn()
  }
}));

describe('Checklist API Functions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('uploadSnagPhoto', () => {
    it('should successfully upload a photo and return a public URL', async () => {
      // Mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const userId = 'test-user-id';
      
      // Mock successful authentication
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null
      });
      
      // Mock successful upload
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test-path' },
          error: null
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' }
        })
      } as any);
      
      const result = await uploadSnagPhoto(userId, mockFile);
      
      // Verify the URL contains the expected base and a cache-busting parameter
      expect(result).toContain('https://example.com/test.jpg');
      expect(result).toContain('?t=');
      
      // Verify upload was called with correct parameters
      expect(supabase.storage.from).toHaveBeenCalledWith('snags');
      expect(supabase.storage.from().upload).toHaveBeenCalledWith(
        expect.stringContaining(userId.replace(/[^a-zA-Z0-9]/g, '')),
        mockFile,
        expect.objectContaining({
          contentType: 'image/jpeg',
          upsert: true
        })
      );
    });
    
    it('should handle upload errors gracefully', async () => {
      // Mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const userId = 'test-user-id';
      
      // Mock successful authentication
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null
      });
      
      // Mock failed upload
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' }
        }),
        getPublicUrl: vi.fn()
      } as any);
      
      await expect(uploadSnagPhoto(userId, mockFile)).rejects.toThrow('Photo upload failed: Upload failed');
    });
    
    it('should handle authentication errors', async () => {
      // Mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const userId = 'test-user-id';
      
      // Mock failed authentication
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { message: 'Not authenticated' }
      });
      
      // Mock failed refresh
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh failed' }
      });
      
      await expect(uploadSnagPhoto(userId, mockFile)).rejects.toThrow('Authentication required to upload files');
    });
    
    it('should handle invalid files', async () => {
      const userId = 'test-user-id';
      
      // Test with empty file
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      await expect(uploadSnagPhoto(userId, emptyFile)).rejects.toThrow('Invalid file');
      
      // Test with null file
      await expect(uploadSnagPhoto(userId, null as any)).rejects.toThrow('Invalid file');
    });
  });
  
  describe('createSnag', () => {
    it('should create a snag successfully', async () => {
      const userId = 'test-user-id';
      const checklistItemId = 123;
      const note = 'Test note';
      const photoUrl = 'https://example.com/test.jpg';
      
      // Mock successful insert
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-snag-id',
                user_id: userId,
                checklist_item_id: checklistItemId,
                note,
                photo_url: photoUrl,
                created_at: new Date().toISOString()
              },
              error: null
            })
          })
        })
      } as any);
      
      const result = await createSnag(userId, checklistItemId, note, photoUrl);
      
      expect(result).toEqual(expect.objectContaining({
        id: 'new-snag-id',
        user_id: userId,
        checklist_item_id: checklistItemId,
        note,
        photo_url: photoUrl
      }));
      
      expect(supabase.from).toHaveBeenCalledWith('snags');
    });
    
    it('should handle errors when creating a snag', async () => {
      const userId = 'test-user-id';
      const checklistItemId = 123;
      
      // Mock failed insert
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' }
            })
          })
        })
      } as any);
      
      await expect(createSnag(userId, checklistItemId, 'Test note', null)).rejects.toThrow();
    });
  });
  
  describe('getUserProgress', () => {
    it('should get user progress successfully', async () => {
      const userId = 'test-user-id';
      const categorySlug = 'outside';
      
      // Mock successful select
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'progress-id',
                  user_id: userId,
                  category_slug: categorySlug,
                  current_step: 5,
                  is_complete: false
                },
                error: null
              })
            })
          })
        })
      } as any);
      
      const result = await getUserProgress(userId, categorySlug);
      
      expect(result).toEqual(expect.objectContaining({
        id: 'progress-id',
        user_id: userId,
        category_slug: categorySlug,
        current_step: 5,
        is_complete: false
      }));
      
      expect(supabase.from).toHaveBeenCalledWith('user_progress');
    });
    
    it('should handle no progress found', async () => {
      const userId = 'test-user-id';
      const categorySlug = 'outside';
      
      // Mock no results
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows returned' }
              })
            })
          })
        })
      } as any);
      
      const result = await getUserProgress(userId, categorySlug);
      
      expect(result).toBeNull();
    });
    
    it('should sanitize category slugs with positional indexes', async () => {
      const userId = 'test-user-id';
      const categorySlug = 'outside:1'; // With positional index
      
      // Mock successful select
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'progress-id',
                  user_id: userId,
                  category_slug: 'outside', // Should be sanitized
                  current_step: 5,
                  is_complete: false
                },
                error: null
              })
            })
          })
        })
      } as any);
      
      const result = await getUserProgress(userId, categorySlug);
      
      // Verify the second eq call used the sanitized slug
      expect(supabase.from().select().eq().eq).toHaveBeenCalledWith('category_slug', 'outside');
      
      expect(result).toEqual(expect.objectContaining({
        category_slug: 'outside'
      }));
    });
  });
  
  describe('updateUserProgress', () => {
    it('should update existing progress', async () => {
      const userId = 'test-user-id';
      const categorySlug = 'outside';
      const currentStep = 5;
      const isComplete = false;
      
      // Mock existing progress
      vi.mock('@/lib/api/checklist', async (importOriginal) => {
        const actual = await importOriginal();
        return {
          ...actual,
          getUserProgress: vi.fn().mockResolvedValue({
            id: 'progress-id',
            user_id: userId,
            category_slug: categorySlug,
            current_step: 4, // Previous step
            is_complete: false
          })
        };
      });
      
      // Mock successful update
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'progress-id',
                  user_id: userId,
                  category_slug: categorySlug,
                  current_step: currentStep,
                  is_complete: isComplete
                },
                error: null
              })
            })
          })
        })
      } as any);
      
      // Need to re-import after mocking
      const { updateUserProgress } = await import('@/lib/api/checklist');
      
      const result = await updateUserProgress(userId, categorySlug, currentStep, isComplete);
      
      expect(result).toEqual(expect.objectContaining({
        id: 'progress-id',
        user_id: userId,
        category_slug: categorySlug,
        current_step: currentStep,
        is_complete: isComplete
      }));
    });
    
    it('should create new progress if none exists', async () => {
      const userId = 'test-user-id';
      const categorySlug = 'inside';
      const currentStep = 1;
      const isComplete = false;
      
      // Mock no existing progress
      vi.mock('@/lib/api/checklist', async (importOriginal) => {
        const actual = await importOriginal();
        return {
          ...actual,
          getUserProgress: vi.fn().mockResolvedValue(null)
        };
      });
      
      // Mock successful upsert
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-progress-id',
                user_id: userId,
                category_slug: categorySlug,
                current_step: currentStep,
                is_complete: isComplete
              },
              error: null
            })
          })
        })
      } as any);
      
      // Need to re-import after mocking
      const { updateUserProgress } = await import('@/lib/api/checklist');
      
      const result = await updateUserProgress(userId, categorySlug, currentStep, isComplete);
      
      expect(result).toEqual(expect.objectContaining({
        id: 'new-progress-id',
        user_id: userId,
        category_slug: categorySlug,
        current_step: currentStep,
        is_complete: isComplete
      }));
      
      // Verify upsert was called with onConflict parameter
      expect(supabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          category_slug: categorySlug,
          current_step: currentStep,
          is_complete: isComplete
        }),
        expect.objectContaining({
          onConflict: 'user_id,category_slug'
        })
      );
    });
    
    it('should sanitize category slugs with positional indexes', async () => {
      const userId = 'test-user-id';
      const categorySlug = 'inside:2'; // With positional index
      const currentStep = 2;
      
      // Mock no existing progress
      vi.mock('@/lib/api/checklist', async (importOriginal) => {
        const actual = await importOriginal();
        return {
          ...actual,
          getUserProgress: vi.fn().mockResolvedValue(null)
        };
      });
      
      // Mock successful upsert
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-progress-id',
                user_id: userId,
                category_slug: 'inside', // Sanitized
                current_step: currentStep,
                is_complete: false
              },
              error: null
            })
          })
        })
      } as any);
      
      // Need to re-import after mocking
      const { updateUserProgress } = await import('@/lib/api/checklist');
      
      const result = await updateUserProgress(userId, categorySlug, currentStep);
      
      // Verify the sanitized slug was used
      expect(supabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          category_slug: 'inside' // Should be sanitized
        }),
        expect.any(Object)
      );
    });
  });
});

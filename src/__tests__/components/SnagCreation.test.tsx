import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NewSnagPage from '@/app/checks/outside/[stepIndex]/snags/new/page';
import { 
  getChecklistItemByOrder,
  createSnag,
  uploadSnagPhoto,
  getChecklistItemCount,
  updateUserProgress
} from '@/lib/api/checklist';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the checklist API functions
vi.mock('@/lib/api/checklist', () => ({
  getChecklistItemByOrder: vi.fn(),
  createSnag: vi.fn(),
  uploadSnagPhoto: vi.fn(),
  getChecklistItemCount: vi.fn(),
  updateUserProgress: vi.fn()
}));

// Mock the debug module
vi.mock('@/lib/debug', () => ({
  debug: {
    log: vi.fn(),
    error: vi.fn()
  }
}));

describe('NewSnagPage Component', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  };
  
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };
  
  const mockChecklistItem = {
    id: 123,
    category_id: 1,
    original_text: 'Check the roof',
    friendly_text: 'Is the roof in good condition?',
    display_order: 1
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup router mock
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    
    // Setup auth mock
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    });
    
    // Setup API mocks
    vi.mocked(getChecklistItemByOrder).mockResolvedValue(mockChecklistItem);
    vi.mocked(createSnag).mockResolvedValue({ id: 'new-snag-id' });
    vi.mocked(uploadSnagPhoto).mockResolvedValue('https://example.com/test.jpg');
    vi.mocked(getChecklistItemCount).mockResolvedValue(18);
    vi.mocked(updateUserProgress).mockResolvedValue({ id: 'progress-id' });
  });
  
  it('should render the form correctly', async () => {
    render(<NewSnagPage params={{ stepIndex: '1' }} />);
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(getChecklistItemByOrder).toHaveBeenCalledWith('outside', 1);
    });
    
    // Check that the form elements are rendered
    expect(screen.getByLabelText(/describe the snag/i)).toBeInTheDocument();
    expect(screen.getByText(/add a photo/i)).toBeInTheDocument();
    expect(screen.getByText(/add snag to your list/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });
  
  it('should validate form inputs', async () => {
    render(<NewSnagPage params={{ stepIndex: '1' }} />);
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(getChecklistItemByOrder).toHaveBeenCalledWith('outside', 1);
    });
    
    // Try to submit without note or photo
    fireEvent.click(screen.getByText(/add snag to your list/i));
    
    // Check for validation message
    expect(await screen.findByText(/please add a note or photo/i)).toBeInTheDocument();
    
    // No API calls should have been made
    expect(createSnag).not.toHaveBeenCalled();
    expect(uploadSnagPhoto).not.toHaveBeenCalled();
  });
  
  it('should handle photo upload and snag creation successfully', async () => {
    render(<NewSnagPage params={{ stepIndex: '1' }} />);
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(getChecklistItemByOrder).toHaveBeenCalledWith('outside', 1);
    });
    
    // Add a note
    fireEvent.change(screen.getByLabelText(/describe the snag/i), {
      target: { value: 'Test snag note' }
    });
    
    // Mock file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/add a photo/i).nextElementSibling;
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Submit the form
    fireEvent.click(screen.getByText(/add snag to your list/i));
    
    // Wait for API calls to complete
    await waitFor(() => {
      expect(uploadSnagPhoto).toHaveBeenCalledWith(mockUser.id, file);
      expect(createSnag).toHaveBeenCalledWith(
        mockUser.id,
        mockChecklistItem.id,
        'Test snag note',
        'https://example.com/test.jpg'
      );
      expect(updateUserProgress).toHaveBeenCalledWith(mockUser.id, 'outside', 1, false);
      expect(mockRouter.push).toHaveBeenCalledWith('/checks/outside/1');
    });
  });
  
  it('should continue with note only if photo upload fails', async () => {
    // Mock photo upload failure
    vi.mocked(uploadSnagPhoto).mockRejectedValue(new Error('Upload failed'));
    
    render(<NewSnagPage params={{ stepIndex: '1' }} />);
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(getChecklistItemByOrder).toHaveBeenCalledWith('outside', 1);
    });
    
    // Add a note
    fireEvent.change(screen.getByLabelText(/describe the snag/i), {
      target: { value: 'Test snag note' }
    });
    
    // Mock file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/add a photo/i).nextElementSibling;
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Submit the form
    fireEvent.click(screen.getByText(/add snag to your list/i));
    
    // Wait for API calls to complete
    await waitFor(() => {
      // Should show error but continue
      expect(screen.getByText(/photo couldn't be uploaded/i)).toBeInTheDocument();
      
      // Should still create snag with note only
      expect(createSnag).toHaveBeenCalledWith(
        mockUser.id,
        mockChecklistItem.id,
        'Test snag note',
        null // No photo URL
      );
      
      // Should still update progress
      expect(updateUserProgress).toHaveBeenCalledWith(mockUser.id, 'outside', 1, false);
      
      // Should still redirect
      expect(mockRouter.push).toHaveBeenCalledWith('/checks/outside/1');
    });
  });
  
  it('should handle invalid step index', async () => {
    // Mock no checklist item found
    vi.mocked(getChecklistItemByOrder).mockResolvedValue(null);
    
    render(<NewSnagPage params={{ stepIndex: '999' }} />);
    
    // Wait for redirect
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/checks/outside');
    });
  });
  
  it('should redirect unauthenticated users', async () => {
    // Mock unauthenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    });
    
    render(<NewSnagPage params={{ stepIndex: '1' }} />);
    
    // Wait for redirect
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/signin');
    });
  });
});

# Snag List Sharing Flow

This module implements the multi-step flow for sharing a snag list with a builder. The flow consists of several steps where users provide information needed to share their snag list.

## Flow Structure

1. **Name Page** (`/snags/share/name`): Collects the user's full name
2. **Address Page** (`/snags/share/address`): Collects the address of the user's new home
3. **Builder Selection** (`/snags/share/builder`): Allows the user to select from the top 10 UK housebuilders or specify "None of these"
4. **Custom Builder Name** (`/snags/share/builder-name`): If "None of these" was selected, collects the custom builder name
5. **Builder Email** (`/snags/share/builder-email`): Collects the builder's email address
6. **Confirmation Page** (`/snags/share/confirm`): Shows a summary of all collected information with "Change" links for each item
7. **Success Page** (`/snags/share/success`): Shown after payment is processed

## Implementation Details

### State Management

The flow uses the `ShareContext` to manage state across the different steps. This context provides:

- `shareData`: Object containing all the collected information
- `updateShareData`: Function to update the share data
- `resetShareData`: Function to reset the share data when the flow is complete

### Data Persistence

When the user confirms their details and proceeds to payment, the data is saved to Supabase in the `shares` table with the following structure:

- `id`: Unique identifier for the share
- `user_id`: ID of the user sharing the snag list
- `full_name`: User's full name
- `address`: Address of the user's new home
- `builder_type`: Selected builder type (one of the top 10 or "other")
- `builder_name`: Builder name (either selected from the list or custom)
- `builder_email`: Builder's email address
- `status`: Current status of the share (pending_payment, paid, sent, failed)
- `payment_id`: ID from the payment provider (when implemented)
- `created_at`: Timestamp when the share was created
- `updated_at`: Timestamp when the share was last updated
- `sent_at`: Timestamp when the share was sent to the builder

### Security

The Supabase table has Row Level Security (RLS) policies to ensure users can only access their own share data.

## Future Enhancements

1. **Payment Integration**: Integrate with a payment provider like Stripe to process the £19.99 payment
2. **Email Delivery**: Implement the actual email delivery to the builder
3. **Share History**: Add a page where users can view their share history
4. **PDF Generation**: Generate a PDF of the snag list to attach to the email

## Accessibility

All pages in the flow are built with accessibility in mind:

- Proper form labels and ARIA attributes
- Keyboard navigation support
- Error messages linked to form fields
- Focus management
- Color contrast compliance

## Mobile Optimization

The flow is designed mobile-first:

- Responsive form elements
- Touch-friendly inputs
- Appropriate input types for mobile (email, etc.)
- Optimized layout for small screens

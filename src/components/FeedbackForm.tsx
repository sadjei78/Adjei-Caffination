import React, { useState } from 'react';
import styled from '@emotion/styled';

interface FeedbackFormProps {
  orderId: string;
  onSubmit: (feedback: OrderFeedback) => void;
  onClose: () => void;
}

interface OrderFeedback {
  orderId: string;
  rating: number;
  comment: string;
  timestamp: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ orderId, onSubmit, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (rating === 0) {
        throw new Error('Please select a rating');
      }
      
      await onSubmit({
        orderId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <h3>How was your drink?</h3>
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <RatingContainer>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarButton
              key={star}
              type="button"
              $selected={star <= rating}
              onClick={() => setRating(star)}
            >
              ⭐
            </StarButton>
          ))}
        </RatingContainer>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you think..."
          rows={4}
        />
        <ButtonGroup>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          <Button type="button" onClick={onClose}>Cancel</Button>
        </ButtonGroup>
      </Form>
    </Dialog>
  );
};

const Dialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RatingContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const StarButton = styled.button<{ $selected: boolean }>`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  opacity: ${props => props.$selected ? 1 : 0.3};
  transition: opacity 0.2s;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #f8d7da;
`;

export default FeedbackForm; 
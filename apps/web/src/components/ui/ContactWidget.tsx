import React, { useState } from 'react';
import { MessageCircle, X, Send, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import api from '../../services/api';

const feedbackSchema = z.object({
  message: z.string().min(5, 'A mensagem deve ter pelo menos 5 caracteres').max(1000, 'Mensagem muito longa'),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

/**
 * ContactWidget renders a floating button that opens a feedback form popover.
 * Allows users to submit structured textual feedback and a 1-5 star rating.
 */
export const ContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('/feedbacks', {
        ...data,
        rating: rating || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setIsSuccess(false);
          setRating(null);
          reset();
        }, 300);
      }, 3000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Ocorreu um erro ao enviar seu feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsSuccess(false);
      setError(null);
      setRating(null);
      reset();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      {/* Popover */}
      <div 
        className={cn(
          "mb-4 bg-surface border border-overlay w-[320px] rounded-2xl shadow-2xl transition-all origin-bottom-right duration-200 overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-pine px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Fale Conosco</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 hover:text-white p-1 h-auto rounded-md">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          {isSuccess ? (
            <div className="text-center py-6 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-foam mx-auto mb-3" />
              <p className="font-bold text-primary text-sm">Feedback Enviado!</p>
              <p className="text-xs text-subtle mt-1">Muito obrigado por nos ajudar a melhorar o Nexus.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-love/10 border border-love/20 text-love text-xs p-2 rounded-xl flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-xs font-medium text-primary">Como você avalia a sua experiência?</span>
                <div className="flex gap-1.5 items-center my-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= (hoverRating ?? rating ?? 0);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-subtle hover:text-gold transition-colors focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "w-5 h-5",
                            isSelected ? "fill-gold text-gold" : "text-subtle/40"
                          )}
                        />
                      </button>
                    );
                  })}
                  {rating && (
                    <span className="text-xs font-semibold text-gold ml-2">{rating} / 5</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-subtle">Sua opinião é fundamental para nós. Como podemos melhorar?</p>
                <textarea 
                  {...register('message')}
                  className={cn(
                    "w-full h-24 bg-white/5 border border-overlay rounded-xl p-3 text-sm text-primary resize-none focus:outline-none focus:ring-2 focus:ring-pine transition-all placeholder:text-subtle/50",
                    errors.message && "border-love focus:ring-love"
                  )}
                  placeholder="Deixe sua mensagem..."
                />
                {errors.message && <p className="text-[10px] text-love">{errors.message.message}</p>}
              </div>

              <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-xl" isLoading={isSubmitting}>
                <Send className="w-3.5 h-3.5 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Trigger Button */}
      <button 
        onClick={toggleOpen}
        className={cn(
          "bg-pine text-white p-3.5 rounded-full shadow-xl hover:shadow-pine/30 transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 focus:ring-offset-base",
          isOpen && "rotate-12"
        )}
        aria-label="Fale Conosco"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

import { useToast } from '@/components/ui/use-toast';
import { Events } from '@/renderer/interfaces';
import { usePaginationStore } from '@/renderer/state';
import { useCallback, useEffect } from 'react';

export function useEventListener() {
  const { setItems } = usePaginationStore();
  const { toast } = useToast();

  const handleMessage = useCallback(
    (_, args) => {
      setItems(args);
    },
    [setItems]
  );

  const handleError = useCallback((_, args) => {
    toast({
      title: 'Error occurred',
      description: args.message,
      variant: 'destructive',
    });
  }, []);

  useEffect(() => {
    window.electron.startListening(handleMessage, Events.Listed);
    window.electron.startListening(handleError, Events.Error);

    window.electron.listItems();

    return () => {
      window.electron.stopListening(handleMessage, Events.Listed);
      window.electron.stopListening(handleError, Events.Error);
    };
  }, [handleMessage, handleError]);
}

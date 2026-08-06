import { Download, Smartphone, Share, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import styles from './InstallPromptModal.module.css';

interface InstallPromptModalProps {
  open: boolean;
  isIOS: boolean;
  onClose: () => void;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallPromptModal({ open, isIOS, onClose, onInstall, onDismiss }: InstallPromptModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isIOS ? 'Add Spy Circle to Home Screen' : 'Install Spy Circle'}
      actions={
        <>
          <Button variant="ghost" onClick={onDismiss}>
            Not now
          </Button>
          <Button onClick={onInstall}>
            <Download size={16} />
            {isIOS ? 'Show me how' : 'Install'}
          </Button>
        </>
      }
    >
      {isIOS ? (
        <div className={styles.body}>
          <p className={styles.text}>
            For the best experience, add Spy Circle to your home screen. You can still play without it.
          </p>
          <ol className={styles.iosSteps}>
            <li>
              <Share size={16} /> Tap the <strong>Share</strong> button in Safari
            </li>
            <li>
              <Smartphone size={16} /> Scroll down and tap <strong>Add to Home Screen</strong>
            </li>
            <li>
              <X size={16} /> Tap <strong>Add</strong> in the top-right corner
            </li>
          </ol>
        </div>
      ) : (
        <div className={styles.body}>
          <p className={styles.text}>
            Install Spy Circle on this device to play offline and launch it instantly — even without an internet
            connection.
          </p>
        </div>
      )}
    </Modal>
  );
}

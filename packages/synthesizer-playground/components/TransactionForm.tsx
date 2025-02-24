import React, { CSSProperties } from 'react';
import CustomInput from './CustomInput';
import saveIcon from '../public/assets/save.svg';

type TransactionFormProps = {
  transactionHash: string;
  setTransactionHash: (value: string) => void;
  handleSubmit: () => void;
  isProcessing: boolean;
  error?: boolean;
};

const TransactionForm = ({
  transactionHash,
  setTransactionHash,
  handleSubmit,
  isProcessing,
  error = false,
}: TransactionFormProps) => {
  const styles: Record<string, CSSProperties> = {
    inputButtonContainer: {
      position: 'absolute',
      top: '424px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'center',
      width: '728px',
      height: '59px',
      zIndex: 2,
    },
    btnProcess: {
      background: error ? '#BC2828' : isProcessing ? '#2A72E5' : '#2A72E5',
      height: '59px',
      width: '159px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      gap: '8px',
      border: '1px solid #a8a8a8',
      borderBottomColor: '#5F5F5F',
      borderRightColor: '#5F5F5F',
      borderRadius: '0',
      padding: 0,
      transition: 'background 0.2s ease',
      cursor: isProcessing ? 'not-allowed' : 'pointer',
      opacity: isProcessing ? 0.6 : 1,
    },
    btnIcon: {
      width: '24px',
      height: '24px',
      position: 'relative',
    },
    btnIconImg: {
      width: '20px',
      height: '20px',
      position: 'absolute',
      left: '2px',
      top: '2px',
    },
    btnText: {
      color: '#F8F8F8',
      fontSize: '24px',
      fontFamily: 'IBM Plex Mono',
      fontWeight: 500,
      wordWrap: 'break-word' as const,
    },
  };

  return (
    <div style={styles.inputButtonContainer}>
      <CustomInput
        label="Transaction Hash"
        value={transactionHash}
        onChange={setTransactionHash}
        disabled={isProcessing}
        error={error}
      />
      <button onClick={handleSubmit} style={styles.btnProcess} disabled={isProcessing}>
        <span style={styles.btnIcon}>
          <img style={styles.btnIconImg} src={saveIcon} alt="icon" />
        </span>
        <span style={styles.btnText}>Process</span>
      </button>
    </div>
  );
};

export default TransactionForm;

import React from 'react';
import { useParams } from 'react-router-dom';

const VideoCall = () => {
  const { roomId } = useParams();

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '80vh',
        zIndex: 9999,
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        backgroundColor: '#000' // Optional dark background
      }}
    >
      <iframe
        src={`https://meet.jit.si/${roomId}`}
        allow="camera; microphone; fullscreen; display-capture"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
        }}
        title="Video Call"
      />
    </div>
  );
};

export default VideoCall;

import React from 'react'

const Custombutton = ({buttonName,titleButtion}) => {
  return (
    <div class="subscribe-demo">
    <div class="tooltip-container">
        <button class="subscribe-btn">
            <div class="pulse-ring"></div>
            <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {buttonName}
        </button>
        
        <div class="tooltip">
            <div class="tooltip-header">
                <svg class="notification-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <h3 class="tooltip-title">{titleButtion}</h3>
            </div>
            
            <p class="tooltip-content">
                Get instant notifications about new content.
            </p>
        </div>
    </div>
</div>
  )
}

export default Custombutton

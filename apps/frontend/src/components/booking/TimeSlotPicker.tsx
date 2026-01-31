import React from 'react';
import './TimeSlotPicker.css';

interface TimeSlot {
    id: string;
    time: string;
    displayTime: string;
    available: boolean;
}

interface TimeSlotPickerProps {
    slots: TimeSlot[];
    selectedSlotId: string | null;
    onSelect: (slotId: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlotId, onSelect }) => {
    return (
        <div className="time-slot-picker">
            <div className="slots-grid">
                {slots.map((slot) => (
                    <button
                        key={slot.id}
                        className={`time-slot ${selectedSlotId === slot.id ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                        onClick={() => slot.available && onSelect(slot.id)}
                        disabled={!slot.available}
                        aria-label={`${slot.displayTime}, ${slot.available ? 'available' : 'unavailable'}`}
                    >
                        <span className="slot-time">{slot.displayTime}</span>
                        {selectedSlotId === slot.id && <span className="check-icon">✓</span>}
                        {!slot.available && <span className="unavailable-badge">Full</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TimeSlotPicker;

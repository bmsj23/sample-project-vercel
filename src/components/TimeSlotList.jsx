import React from 'react';

function TimeSlotList({ space, selectedDate, selectedSlot, setSelectedSlot, isSubmitting, isSlotBooked, isSlotTimePast }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
        Select Time Slot
      </label>
      <div className="space-y-2">
        {(space.time_slots || []).map((slot, index) => {
          const label = slot.label || slot;
          const isSlotAlreadyBooked = selectedDate && isSlotBooked(selectedDate, label);
          const isSlotPassed = selectedDate ? isSlotTimePast(slot, selectedDate) : false;

          return (
            <label
              key={index}
              className={`flex items-center p-3 border rounded-lg transition-colors ${
                isSlotAlreadyBooked
                  ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
                  : isSlotPassed
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75'
                  : selectedSlot === label
                  ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-pointer'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
              }`}>
              <input
                type="radio"
                name="timeSlot"
                value={label}
                checked={selectedSlot === label}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                disabled={isSubmitting || isSlotAlreadyBooked || isSlotPassed} />
              <span className={`ml-3 font-medium ${isSlotAlreadyBooked ? 'text-red-600' : isSlotPassed ? 'text-gray-400' : ''}`}>
                {label}
                {isSlotAlreadyBooked && (
                  <span className="ml-2 text-sm text-red-500">(Already booked)</span>
                )}
                {isSlotPassed && (
                  <span className="ml-2 text-sm text-gray-500">(Time passed)</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default TimeSlotList;

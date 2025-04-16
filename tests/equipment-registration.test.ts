import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
// Note: This is a simplified mock for testing purposes
const mockClarity = () => {
  let lastElevatorId = 0;
  const elevators = new Map();
  const txSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Mock address
  
  return {
    registerElevator: (buildingAddress, model, manufacturer, installationDate, capacity, floorsServiced) => {
      const newId = lastElevatorId + 1;
      lastElevatorId = newId;
      
      elevators.set(newId, {
        buildingAddress,
        model,
        manufacturer,
        installationDate,
        capacity,
        floorsServiced,
        lastMaintenance: 0,
        owner: txSender
      });
      
      return { value: newId };
    },
    
    updateMaintenance: (elevatorId, maintenanceDate) => {
      if (!elevators.has(elevatorId)) {
        return { error: 404 };
      }
      
      const elevator = elevators.get(elevatorId);
      if (elevator.owner !== txSender) {
        return { error: 403 };
      }
      
      elevator.lastMaintenance = maintenanceDate;
      elevators.set(elevatorId, elevator);
      
      return { value: true };
    },
    
    getElevator: (elevatorId) => {
      return elevators.get(elevatorId) || null;
    },
    
    getElevatorCount: () => {
      return lastElevatorId;
    }
  };
};

describe('Equipment Registration Contract', () => {
  let contract;
  
  beforeEach(() => {
    contract = mockClarity();
  });
  
  it('should register a new elevator', () => {
    const result = contract.registerElevator(
        '123 Main St',
        'ElevatorX5000',
        'ElevatorCorp',
        1000,
        1500,
        [1, 2, 3, 4, 5]
    );
    
    expect(result.value).toBe(1);
    expect(contract.getElevatorCount()).toBe(1);
    
    const elevator = contract.getElevator(1);
    expect(elevator).not.toBeNull();
    expect(elevator.buildingAddress).toBe('123 Main St');
    expect(elevator.model).toBe('ElevatorX5000');
    expect(elevator.lastMaintenance).toBe(0);
  });
  
  it('should update elevator maintenance date', () => {
    // Register an elevator first
    contract.registerElevator(
        '123 Main St',
        'ElevatorX5000',
        'ElevatorCorp',
        1000,
        1500,
        [1, 2, 3, 4, 5]
    );
    
    // Update maintenance
    const result = contract.updateMaintenance(1, 2000);
    expect(result.value).toBe(true);
    
    // Check if maintenance date was updated
    const elevator = contract.getElevator(1);
    expect(elevator.lastMaintenance).toBe(2000);
  });
  
  it('should fail to update maintenance for non-existent elevator', () => {
    const result = contract.updateMaintenance(999, 2000);
    expect(result.error).toBe(404);
  });
});

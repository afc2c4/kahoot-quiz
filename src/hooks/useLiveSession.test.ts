import { expect } from 'chai';
import sinon from 'sinon';
import { renderHook } from '@testing-library/react';
import { useLiveSession } from './useLiveSession';
import { firestoreModule } from '../lib/firestoreModule';

describe('useLiveSession', () => {
  let onSnapshotStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub onSnapshot from firebase/firestore
    onSnapshotStub = sinon.stub(firestoreModule, 'onSnapshot');
    
    // We also need to stub doc from firebase/firestore
    sinon.stub(firestoreModule, 'doc').returns({} as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return initial state of null and loading true when no sessionId is provided', () => {
    const { result } = renderHook(() => useLiveSession(''));
    
    expect(result.current.session).to.be.null;
    expect(result.current.loading).to.be.true;
    expect(onSnapshotStub.called).to.be.false;
  });

  it('should call onSnapshot and update session state', () => {
    // Mock the callback logic
    const mockData = { title: 'Test Session' };
    const mockDoc = { id: 'session1', data: () => mockData };
    
    onSnapshotStub.callsFake((_ref, callback) => {
      callback(mockDoc);
      return () => {}; // return unsubscribe function
    });

    const { result } = renderHook(() => useLiveSession('session1'));

    expect(onSnapshotStub.calledOnce).to.be.true;
    expect(result.current.loading).to.be.false;
    expect(result.current.session).to.deep.equal({ id: 'session1', ...mockData });
  });
});

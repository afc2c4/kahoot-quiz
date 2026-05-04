import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentJoin from './StudentJoin';
import { firestoreModule } from '../lib/firestoreModule';

describe('StudentJoin Component', () => {
  let getDocStub: sinon.SinonStub;
  let setDocStub: sinon.SinonStub;

  beforeEach(() => {
    // We must stub the functions used inside the component
    getDocStub = sinon.stub(firestoreModule, 'getDoc');
    setDocStub = sinon.stub(firestoreModule, 'setDoc');
    sinon.stub(firestoreModule, 'doc').returns({} as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('renders correctly', () => {
    render(<StudentJoin onJoin={() => {}} />);
    expect(screen.getByText('Entrar no Quiz')).to.exist;
    expect(screen.getByPlaceholderText('PIN')).to.exist;
    expect(screen.getByPlaceholderText('Seu Nome')).to.exist;
  });

  it('shows error when trying to join with empty fields', async () => {
    render(<StudentJoin onJoin={() => {}} />);
    
    const button = screen.getByText('Entrar no Jogo');
    expect((button as HTMLButtonElement).disabled).to.be.true;
  });

  it('calls onJoin when session exists', async () => {
    const onJoinSpy = sinon.spy();
    
    // Simulate session exists
    getDocStub.resolves({ exists: () => true });
    setDocStub.resolves();

    render(<StudentJoin onJoin={onJoinSpy} />);
    
    const pinInput = screen.getByPlaceholderText('PIN');
    const nameInput = screen.getByPlaceholderText('Seu Nome');
    const button = screen.getByText('Entrar no Jogo');

    fireEvent.change(pinInput, { target: { value: '123456' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(getDocStub.calledOnce).to.be.true;
      expect(setDocStub.calledOnce).to.be.true;
      expect(onJoinSpy.calledOnce).to.be.true;
      expect(onJoinSpy.firstCall.args[0]).to.equal('123456');
    });
  });

  it('shows error when session does not exist', async () => {
    const onJoinSpy = sinon.spy();
    
    // Simulate session does NOT exist
    getDocStub.resolves({ exists: () => false });

    render(<StudentJoin onJoin={onJoinSpy} />);
    
    const pinInput = screen.getByPlaceholderText('PIN');
    const nameInput = screen.getByPlaceholderText('Seu Nome');
    const button = screen.getByText('Entrar no Jogo');

    fireEvent.change(pinInput, { target: { value: '999999' } });
    fireEvent.change(nameInput, { target: { value: 'Unknown' } });
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(getDocStub.calledOnce).to.be.true;
      expect(screen.getByText('PIN inválido ou sessão não encontrada.')).to.exist;
      expect(onJoinSpy.called).to.be.false;
    });
  });
});

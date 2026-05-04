import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { firestoreModule } from './lib/firestoreModule';
import { db } from './lib/firebaseClient';

describe('App Integration', () => {
  let onSnapshotStub: sinon.SinonStub;
  let getDocStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub onSnapshot globally since TeacherDashboard uses it
    onSnapshotStub = sinon.stub(firestoreModule, 'onSnapshot').returns(() => {});
    getDocStub = sinon.stub(firestoreModule, 'getDoc').resolves({ exists: () => false });
    
    // Stub query and other firestore methods that might be called on mount
    sinon.stub(firestoreModule, 'query').returns({} as any);
    sinon.stub(firestoreModule, 'collection').returns({} as any);
    sinon.stub(firestoreModule, 'getDocs').resolves({ docs: [] } as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('navigates between roles correctly', async () => {
    render(<App />);

    // Verifica a tela inicial
    expect(screen.getByText('Como você deseja acessar?')).to.exist;

    // Vai para a tela de Aluno
    fireEvent.click(screen.getByText('Sou Aluno'));
    await waitFor(() => {
      expect(screen.getByText('Entrar no Quiz')).to.exist;
      expect(screen.getByPlaceholderText('PIN')).to.exist;
    });

    // Volta para o início
    fireEvent.click(screen.getByText('← Voltar para Início'));
    await waitFor(() => {
      expect(screen.getByText('Como você deseja acessar?')).to.exist;
    });

    // Vai para a tela de Professor
    fireEvent.click(screen.getByText('Sou Professor'));
    await waitFor(() => {
      // TeacherDashboard has a login screen
      expect(screen.getByText('Acesso do Professor')).to.exist;
    });
  });
});

// O back respondeu 409 ao chamar: outro consultório chamou este paciente primeiro.
export class PatientAlreadyCalledError extends Error {
  constructor() {
    super('Este paciente já foi chamado por outro consultório.');
    this.name = 'PatientAlreadyCalledError';
  }
}

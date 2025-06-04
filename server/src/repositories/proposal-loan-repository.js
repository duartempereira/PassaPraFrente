import sql from 'mssql'

import { getConnection } from '../database/db-config.js'

class ProposalLoanRepository {
  static async createProposalLoan (userId, id, newValue, newStartDate, newEndDate, accepted) {
    const pool = await getConnection()

    const proposal = await pool
      .request()
      .input('novoValor', sql.Float, newValue)
      .input('novaDataInicio', sql.DateTime, newStartDate)
      .input('novaDataFim', sql.DateTime, newEndDate)
      .input('userId', sql.Int, userId)
      .input('emprestimoId', sql.Int, id)
      .input('accepted', sql.TinyInt, accepted)
      .query(`
        INSERT INTO 
        PropostaEmprestimo(Utilizador_ID, Emprestimo_ID, NovoValor, NovaDataInicio, NovaDataFim, Aceite) 
        VALUES (@userId, @emprestimoId, @novoValor, @novaDataInicio, @novaDataFim, @accepted)
    `)

    return proposal.rowsAffected[0] > 0
  }

  static async getAllLoanProposals () {
    const pool = await getConnection()

    const proposals = await pool
      .request()
      .query(`
        SELECT *
        FROM PropostaEmprestimo
    `)

    return proposals.recordset
  }

  static async getLoanProposalById (userId, id) {
    const pool = await getConnection()

    const proposal = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('emprestimoId', sql.Int, id)
      .query(`
        SELECT *
        FROM PropostaEmprestimo
        WHERE Emprestimo_ID = @emprestimoId AND Utilizador_ID = @userId
      `)

    return proposal.recordset[0]
  }

  static async getLoanProposalByLoanId (id) {
    const pool = await getConnection()

    const proposal = await pool
      .request()
      .input('loanId', sql.Int, id)
      .query(`
        SELECT *
        FROM PropostaEmprestimo
        WHERE Emprestimo_ID = @loanId
      `)

    return proposal.recordset[0]
  }

  static async updateProposalLoanStatus (userId, loanId, status) {
    const pool = await getConnection()

    const updatedProposal = pool.request()
      .input('emprestimoId', sql.Int, loanId)
      .input('userId', sql.Int, userId)
      .input('status', sql.TinyInt, status)
      .query(`
        UPDATE PropostaEmprestimo
        SET Aceite = @status
        WHERE Emprestimo_ID = @emprestimoId AND Utilizador_ID = @userId
      `)

    return updatedProposal.recordset
  }

  static async getLoanProposalsByUser (userId) {
    const pool = await getConnection()

    const proposals = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT *
        FROM PropostaEmprestimo
        WHERE Utilizador_ID = @userId
      `)

    return proposals.recordset
  }
}

export default ProposalLoanRepository

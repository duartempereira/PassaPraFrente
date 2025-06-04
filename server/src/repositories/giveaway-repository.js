import sql from 'mssql'

import { getConnection } from '../database/db-config.js'
import ItemRepository from './item-repository.js'
import { GIVEAWAY_STATES } from '../constants/status-constants.js'

class GiveawayRepository {
  static async createGiveaway (item, data, userId) {
    const pool = await getConnection()

    const giveaway = await pool
      .request()
      .input('dataInicio', sql.DateTime, data.startDate)
      .input('dataFim', sql.DateTime, data.endDate)
      .input('titulo', sql.VarChar, data.title)
      .input('descricao', sql.VarChar, data.description)
      .input('itemId', sql.Int, item.Artigo_ID)
      .input('userId', sql.Int, userId)
      .input('estadoId', sql.Int, GIVEAWAY_STATES.EM_ANALISE)
      .query(`
        INSERT INTO Sorteio (DataInicio, DataFim, Titulo, Descricao, ArtigoArtigo_ID, Utilizador_ID, Estado_ID)
        VALUES (@dataInicio, @dataFim, @titulo, @descricao, @itemId, @userId, @estadoId)
      `)

    return giveaway.rowsAffected[0] > 0
  }

  static async getGiveawayById (id) {
    const pool = await getConnection()

    const giveaway = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT Sorteio_ID, DataFim, DataInicio, Titulo, Descricao, NomeCategoria, Condicao, Contacto, Sorteio.Utilizador_ID, Estado_ID, Artigo_ID, Utilizador.Nome
        FROM Sorteio
        JOIN Utilizador ON Utilizador.Utilizador_ID = Sorteio.Utilizador_ID
        JOIN Artigo ON Artigo.Artigo_ID = Sorteio.ArtigoArtigo_ID
        JOIN Categoria ON Categoria.Categoria_ID = Artigo.Categoria_ID
        JOIN Condicao ON Condicao.Condicao_ID = Artigo.Condicao_ID
        WHERE Sorteio_ID = @id
    `)

    return giveaway.recordset[0]
  }

  static async getAllGiveaways () {
    const pool = await getConnection()

    const giveaways = await pool
      .request()
      .query(`
        SELECT * 
        FROM Sorteio
      `)

    return giveaways.recordset
  }

  static async getAvailableGiveaways (userId) {
    const pool = await getConnection()

    const availableGiveaways = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Sorteio_ID, Titulo, Descricao, DataInicio, DataFim, Utilizador_ID, Sorteio.ArtigoArtigo_ID, Estado, Condicao, NomeCategoria
        FROM Sorteio
        JOIN Estado ON Estado.Estado_ID = Sorteio.Estado_ID
        JOIN Artigo ON Artigo.Artigo_ID = Sorteio.ArtigoArtigo_ID
        JOIN Categoria ON Categoria.Categoria_ID = Artigo.Categoria_ID
        JOIN Condicao ON Condicao.Condicao_ID = Artigo.Condicao_ID
        WHERE Estado.Estado = 'Disponível' AND Sorteio.Utilizador_ID <> @userId
      `)

    return availableGiveaways.recordset
  }

  static async getPendingGiveaways () {
    const pool = await getConnection()

    const pendingGiveaways = await pool
      .request()
      .query(`
        SELECT * 
        FROM Sorteio
        JOIN Estado ON Estado.Estado_ID = Sorteio.Estado_ID
        WHERE Estado.Estado = 'Em análise'
      `)

    return pendingGiveaways.recordset
  }

  static async updateGiveaway (id, data) {
    const pool = await getConnection()

    const transaction = pool.transaction()

    try {
      await transaction.begin()

      await ItemRepository.updateItem(data.category, data.condition, data.itemId, transaction)

      await transaction
        .request()
        .input('id', sql.Int, id)
        .input('dataInicio', sql.DateTime, data.startDate)
        .input('dataFim', sql.DateTime, data.endDate)
        .input('titulo', sql.VarChar, data.title)
        .input('descricao', sql.VarChar, data.description)
        .query(`
          UPDATE Sorteio
          SET DataInicio = @dataInicio,
              DataFim = @dataFim,
              Titulo = @titulo,
              Descricao = @descricao
          WHERE Sorteio_ID = @id
        `)

      await transaction.commit()

      return true
    } catch (error) {
      await transaction.rollback()
    }
  }

  static async getUserGiveaways (userId) {
    const pool = await getConnection()

    const giveaways = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * 
        FROM Sorteio
        WHERE Utilizador_ID = @userId
      `)

    return giveaways.recordset
  }

  static async updateGiveawayStatus (givewayId, stateId) {
    const pool = await getConnection()

    const updatedGiveaway = await pool
      .request()
      .input('givewayId', sql.Int, givewayId)
      .input('stateId', sql.Int, stateId)
      .query(`
        UPDATE Sorteio
        SET Estado_ID = @stateId
        WHERE Sorteio_ID = @givewayId
      `)

    return updatedGiveaway.rowsAffected[0] > 0
  }

  static async getNonCompletedGiveawaysByUser (userId) {
    const pool = await getConnection()

    const uncompletedGiveaways = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Sorteio_ID, Titulo, Descricao, DataInicio, DataFim, Utilizador_ID, Sorteio.ArtigoArtigo_ID, Estado.Estado, Condicao, NomeCategoria
        FROM Sorteio
        JOIN Estado ON Estado.Estado_ID = Sorteio.Estado_ID
        JOIN Artigo ON Artigo.Artigo_ID = Sorteio.ArtigoArtigo_ID
        JOIN Categoria ON Categoria.Categoria_ID = Artigo.Categoria_ID
        JOIN Condicao ON Condicao.Condicao_ID = Artigo.Condicao_ID
        WHERE Estado.Estado <> 'Concluído' AND Utilizador_ID = @userId
      `)

    return uncompletedGiveaways.recordset
  }

  static async getCompletedGiveawaysByUser (userId) {
    const pool = await getConnection()

    const completedGiveaways = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Sorteio_ID, Titulo, Descricao, DataInicio, DataFim, Utilizador_ID, Sorteio.ArtigoArtigo_ID, Estado.Estado, Condicao, NomeCategoria
        FROM Sorteio
        JOIN Estado ON Estado.Estado_ID = Sorteio.Estado_ID
        JOIN Artigo ON Artigo.Artigo_ID = Sorteio.ArtigoArtigo_ID
        JOIN Categoria ON Categoria.Categoria_ID = Artigo.Categoria_ID
        JOIN Condicao ON Condicao.Condicao_ID = Artigo.Condicao_ID
        WHERE Estado.Estado = 'Concluído' AND Utilizador_ID = @userId
      `)

    return completedGiveaways.recordset
  }
}

export default GiveawayRepository

import { StatusCodes } from 'http-status-codes'

import response from '../utils/response.js'
import { handleError, HttpException } from '../utils/error-handler.js'
import EntryGiveawayRepository from '../repositories/entry-giveaway-repository.js'
import GiveawayRepository from '../repositories/giveaway-repository.js'

class EntryGiveawayController {
  static async createEntryGiveaway (req, res) {
    const { giveawayId } = req.params
    const userId = req.user.Utilizador_ID

    const entryDate = new Date().toISOString()

    const data = {
      giveawayId,
      userId,
      entryDate
    }

    try {
      const giveaway = await GiveawayRepository.getGiveawayById(giveawayId)

      if (!giveaway) {
        throw new HttpException('Sorteio não encontrado', StatusCodes.NOT_FOUND)
      }

      if (userId === giveaway.Utilizador_ID) {
        throw new HttpException('Não é possível inscrever-se no seu próprio sorteio.', StatusCodes.BAD_REQUEST)
      }

      if (giveaway.DataInicio > new Date()) {
        throw new HttpException('O sorteio ainda não começou. Não é possível inscrever-se.', StatusCodes.BAD_REQUEST)
      }

      if (giveaway.DataFim < new Date()) {
        throw new HttpException('O sorteio já terminou. Já não é possível inscrever-se.', StatusCodes.BAD_REQUEST)
      }

      const existingEntry = await EntryGiveawayRepository.getEntryGiveawayById(giveawayId, userId)

      if (existingEntry) {
        throw new HttpException('Já está inscrito neste sorteio.', StatusCodes.BAD_REQUEST)
      }

      await EntryGiveawayRepository.createEntryGiveaway(data)

      return response(res, true, StatusCodes.CREATED, 'Inscrição criada com sucesso.')
    } catch (error) {
      handleError(res, error, 'Erro ao criar a inscrição no sorteio. Tente novamente mais tarde.')
    }
  }

  static async getEntryGiveawayById (req, res) {
    const { giveawayId } = req.params
    const userId = req.user.Utilizador_ID

    try {
      const giveaway = await EntryGiveawayRepository.getEntryGiveawayById(giveawayId, userId)

      if (!giveaway) {
        throw new HttpException('Inscrição não encontrada.', StatusCodes.NOT_FOUND)
      }

      return response(res, true, StatusCodes.OK, giveaway)
    } catch (error) {
      handleError(res, error, 'Erro ao obter a inscrição no sorteio. Tente novamente mais tarde.')
    }
  }

  static async getAllEntryGiveawaysByUserId (req, res) {
    const userId = req.user.Utilizador_ID

    try {
      const entryGiveaways = await EntryGiveawayRepository.getAllEntryGiveawaysByUserId(userId)

      return response(res, true, StatusCodes.OK, entryGiveaways)
    } catch (error) {
      handleError(res, error, 'Erro ao obter as inscrições no sorteio. Tente novamente mais tarde.')
    }
  }

  static async getAllEntryGiveawaysByGiveaway (req, res) {
    const { giveawayId } = req.params

    try {
      const entryGiveaways = await EntryGiveawayRepository.getAllEntryGiveawaysByGiveaway(giveawayId)

      return response(res, true, StatusCodes.OK, entryGiveaways)
    } catch (error) {
      handleError(res, error, 'Erro ao obter as inscrições no sorteio. Tente novamente mais tarde.')
    }
  }
}

export default EntryGiveawayController

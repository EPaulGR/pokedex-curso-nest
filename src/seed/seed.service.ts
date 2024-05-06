import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private pokemonModel: Model<Pokemon>,
  ) {}

  async executeSeed() {
    // borro lo que existe
    await this.pokemonModel.deleteMany({});
    // obtengo los nuevos datos
    const { data } = await axios.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    // construyo el nuevo array
    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });
    // inserto los nuevos datos
    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'seed executed successfully!';
  }
}

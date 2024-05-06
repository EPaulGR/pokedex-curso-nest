import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    // borro lo que existe
    await this.pokemonModel.deleteMany({});
    // obtengo los nuevos datos
    const data = await this.http.get<PokeResponse>(
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

import { test, expect } from '@playwright/test'

const baseUrl = 'https://pokeapi.co/api/v2/'

test('get favorite pokemon and verify type', async ({ request }) => {
  let pokemonUrl: string
  let pokemonFormUrl: string

  await test.step('get favorite pokemon', async () => {
    const response = await request.get(`${baseUrl}pokemon?limit=50&offset=0`)
    await expect(response).toBeOK()

    const data = await response.json()
    const favoritePokemon = data.results.find((pokemon: { name: string }) => pokemon.name === 'pikachu')
    expect(favoritePokemon, 'pikachu should be in the first 50 pokemon').toBeDefined()
    pokemonUrl = favoritePokemon.url
  })

  await test.step('get pokemon form', async () => {
    const response = await request.get(pokemonUrl)
    await expect(response).toBeOK()

    const pokemon = await response.json()
    // forms is an array, so the URL lives on its first entry.
    pokemonFormUrl = pokemon.forms[0].url
  })

  await test.step('verify pokemon type', async () => {
    const response = await request.get(pokemonFormUrl)
    await expect(response).toBeOK()

    const pokemonForm = await response.json()
    // type is an object ({ name, url }), so compare its name.
    expect(pokemonForm.types[0].type.name).toBe('electric')
  })
})

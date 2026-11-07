import bcrypt from 'bcryptjs'

async function generateHashes() {
  const passwords = {
    admin: 'kings2020',
    ruben: 'king2020',
    bruno: 'ricardo2020',
    vitor: 'miguel2020',
    nuno: 'miguel2020',
  }

  console.log('=== BCRYPT HASHES (12 rounds) ===\n')

  for (const [username, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 12)
    console.log(`${username} / ${password}:`)
    console.log(`  ${hash}\n`)
  }
}

generateHashes().catch(console.error)
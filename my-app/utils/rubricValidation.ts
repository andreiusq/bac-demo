interface DetailedScores {
  subiect1A: {
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
  };
  subiect1B: {
    opinie: number;
    argumente: number;
    dezvoltare: number;
    valorificare: number;
    concluzie: number;
    conectori: number;
    limbaj: number;
    ortografie: number;
    formatare: number;
    cuvinte: number;
  };
  subiect2: {
    continut: number;
    redactare: number;
  };
  subiect3: {
    personaje: number;
    relatii: number;
    analiza: number;
    redactare: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateScores(scores: DetailedScores): ValidationResult {
  const errors: string[] = [];

  // Validate Subiectul I.A
  Object.entries(scores.subiect1A).forEach(([key, value]) => {
    if (value < 0 || value > 6) {
      errors.push(`Subiectul I.A - Item ${key.replace('item', '')}: Scorul trebuie să fie între 0 și 6 puncte`);
    }
  });

  // Validate Subiectul I.B
  Object.entries(scores.subiect1B).forEach(([key, value]) => {
    const maxPoints = key === 'conectori' ? 2 : 1;
    if (value < 0 || value > maxPoints) {
      errors.push(`Subiectul I.B - ${key.charAt(0).toUpperCase() + key.slice(1)}: Scorul trebuie să fie între 0 și ${maxPoints} puncte`);
    }
  });

  // Validate Subiectul II
  if (scores.subiect2.continut < 0 || scores.subiect2.continut > 6) {
    errors.push('Subiectul II - Conținut: Scorul trebuie să fie între 0 și 6 puncte');
  }
  if (scores.subiect2.redactare < 0 || scores.subiect2.redactare > 4) {
    errors.push('Subiectul II - Redactare: Scorul trebuie să fie între 0 și 4 puncte');
  }

  // Validate Subiectul III
  if (scores.subiect3.personaje < 0 || scores.subiect3.personaje > 6) {
    errors.push('Subiectul III - Personaje: Scorul trebuie să fie între 0 și 6 puncte');
  }
  if (scores.subiect3.relatii < 0 || scores.subiect3.relatii > 6) {
    errors.push('Subiectul III - Relații: Scorul trebuie să fie între 0 și 6 puncte');
  }
  if (scores.subiect3.analiza < 0 || scores.subiect3.analiza > 6) {
    errors.push('Subiectul III - Analiză: Scorul trebuie să fie între 0 și 6 puncte');
  }
  if (scores.subiect3.redactare < 0 || scores.subiect3.redactare > 12) {
    errors.push('Subiectul III - Redactare: Scorul trebuie să fie între 0 și 12 puncte');
  }

  // Validate total score
  const totalScore = calculateTotalScore(scores);
  if (totalScore > 100) {
    errors.push('Punctajul total nu poate depăși 100 de puncte');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function calculateTotalScore(scores: DetailedScores): number {
  const subiect1A = Object.values(scores.subiect1A).reduce((a, b) => a + b, 0);
  const subiect1B = Object.values(scores.subiect1B).reduce((a, b) => a + b, 0);
  const subiect2 = scores.subiect2.continut + scores.subiect2.redactare;
  const subiect3 = scores.subiect3.personaje + scores.subiect3.relatii + 
                   scores.subiect3.analiza + scores.subiect3.redactare;
  
  return subiect1A + subiect1B + subiect2 + subiect3 + 10; // +10 puncte din oficiu
} 
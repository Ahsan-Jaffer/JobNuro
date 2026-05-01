const tokenize = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
};

const buildTermFrequency = (tokens) => {
  const frequency = {};

  tokens.forEach((token) => {
    frequency[token] = (frequency[token] || 0) + 1;
  });

  const totalTokens = tokens.length || 1;

  Object.keys(frequency).forEach((term) => {
    frequency[term] = frequency[term] / totalTokens;
  });

  return frequency;
};

const calculateIdf = (documentsTokens) => {
  const idf = {};
  const totalDocuments = documentsTokens.length;
  const vocabulary = new Set(documentsTokens.flat());

  vocabulary.forEach((term) => {
    const documentsContainingTerm = documentsTokens.filter((tokens) =>
      tokens.includes(term)
    ).length;

    idf[term] = Math.log((totalDocuments + 1) / (documentsContainingTerm + 1)) + 1;
  });

  return idf;
};

const buildTfidfVector = (termFrequency, idf, vocabulary) => {
  return vocabulary.map((term) => (termFrequency[term] || 0) * (idf[term] || 0));
};

const cosineSimilarity = (vectorA, vectorB) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    dotProduct += vectorA[index] * vectorB[index];
    magnitudeA += vectorA[index] * vectorA[index];
    magnitudeB += vectorB[index] * vectorB[index];
  }

  if (!magnitudeA || !magnitudeB) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
};

export const calculateTfidfSimilarity = (textA, textB) => {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (!tokensA.length || !tokensB.length) {
    return 0;
  }

  const documentsTokens = [tokensA, tokensB];
  const vocabulary = Array.from(new Set([...tokensA, ...tokensB]));

  const termFrequencyA = buildTermFrequency(tokensA);
  const termFrequencyB = buildTermFrequency(tokensB);
  const idf = calculateIdf(documentsTokens);

  const vectorA = buildTfidfVector(termFrequencyA, idf, vocabulary);
  const vectorB = buildTfidfVector(termFrequencyB, idf, vocabulary);

  const similarity = cosineSimilarity(vectorA, vectorB);

  return Number(Math.min(Math.max(similarity, 0), 1).toFixed(4));
};
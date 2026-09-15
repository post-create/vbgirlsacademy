const Anthropic = require("@anthropic-ai/sdk");

let client = null;

function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

module.exports = { getClient, isConfigured };

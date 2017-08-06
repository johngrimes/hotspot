import pick from 'lodash.pick'

import { OpOutcomeError } from '../errorTypes.js'

export const extractRawJsonMetadata = async raw =>
  extractJsonMetadata(JSON.parse(raw))

export const extractJsonMetadata = async parsed => {
  try {
    const metadata = {}
    // For the purposes of a display title, prefer title over name over resource
    // type.
    if (parsed.resourceType) {
      metadata.resourceType = parsed.resourceType
      metadata.title = parsed.resourceType
    }
    if (parsed.name) {
      metadata.title = parsed.name
    }
    if (parsed.title) {
      metadata.title = parsed.title
    }
    if (parsed.url) {
      metadata.url = parsed.url
    }
    if (parsed.version) {
      metadata.version = parsed.version
    }
    // Get the narrative.
    if (parsed.text && parsed.text.div) {
      metadata.narrative = parsed.text.div
    }
    if (metadata.resourceType === 'ValueSet' && metadata.url) {
      // Use the `url` element as the ValueSet URI if the resource is a ValueSet.
      metadata.valueSetUri = metadata.url
    } else if (metadata.resourceType === 'CodeSystem' && parsed.valueSet) {
      // Use the `valueSet` element as the ValueSet URI if the resource is a
      // CodeSystem.
      metadata.valueSetUri = parsed.valueSet
    }
    // Note the presence of an expansion, in the case of a ValueSet.
    if (metadata.resourceType === 'ValueSet' && parsed.expansion) {
      metadata.expansion = parsed.expansion
    }
    // Save the whole resource if this is a Bundle.
    if (metadata.resourceType === 'Bundle') {
      metadata.bundle = parsed
    }
    return metadata
  } catch (error) {
    throw new Error(
      `There was a problem parsing the JSON FHIR resource: "${error.message}"`
    )
  }
}

export const extractCodesFromJSONExpansion = async expansion => {
  if (!expansion.contains) return []
  return expansion.contains.map(code =>
    pick(code, 'system', 'code', 'display', 'abstract', 'inactive', 'version')
  )
}

export const extractEntriesFromJsonBundle = async bundle => {
  if (!bundle.entry) return []
  return bundle.entry.map(entry => pick(entry, 'resource', 'fullUrl'))
}

export const opOutcomeFromJsonResponse = response => {
  if (response.data.resourceType !== 'OperationOutcome') return null
  if (response.data.issue.length === 0) return null
  return new OpOutcomeError(
    pick(
      // We only ever look at the first issue described within an
      // OperationOutcome resource.
      response.data.issue[0],
      'severity',
      'code',
      'details',
      'diagnostics',
      'location',
      'expression'
    )
  )
}
## Hotspot

A human-friendly HTML landing page for users resolving URLs within their browser that point to resources on a FHIR server.

This is a pure client-side app that is configured to point to a FHIR endpoint.

#### Features

* Rendering of raw JSON and XML resources, including pretty-printing and syntax highlighting.
* Rendering of narratives within resources, including proper whitelisting of HTML content as per the FHIR spec.
* Support for basic CSS classes for narratives defined in the FHIR spec: http://hl7.org/fhir/STU3/narrative.html#css
* Support for smart translation of link hrefs within narratives, to ensure appropriate behaviour when following absolute and relative links.
* Support for a custom stylesheet that can be used to override styles within narratives.
* Rendering of ValueSet expansions, including the implicit ValueSet within each CodeSystem.
* Rendering of Bundle resources as an expandable list, with links off to full resources and expansions where available.
* Proper handling of OperationOutcome resources, including rendering of error information contained within OperationOutcome response bodies.

It can be configured with a custom stylesheet to be applied to narratives within FHIR resources.

#### Common tasks

##### Install local development dependencies

* Node.js (https://nodejs.org/)
* Yarn (https://yarnpkg.com/en/docs/install)

##### Run it up locally

```
yarn
yarn start
```

Edit `public/config.json` to customise.

##### Build for production

```
yarn build
```

##### Build the Docker image

Requires the `DOCKER_IMAGE` environment variable to be set.

```
yarn dockerize
```

#### Configuration

The Docker image can be configured using the following environment variables:

* `HOTSPOT_FHIR_SERVER`: The FHIR endpoint used for retrieving requested FHIR resources.
  The path component of the URL is appended to this value upon each request, e.g.
  if your `HOTSPOT_FHIR_SERVER` was http://ontoserver.csiro.au/stu3-latest, then a request
  with the path `/CodeSystem/some-code-system` would retrieve the resource from
  http://ontoserver.csiro.au/stu3-latest/CodeSystem/some-code-system. Defaults to `https://ontoserver.csiro.au/stu3-latest`.
* `HOTSPOT_FHIR_VERSION`: The version of FHIR (x.y.z) assumed to be in use by the FHIR server. Defaults to `3.0.1`.
* `HOTSPOT_NARRATIVE_STYLES`: A URL to a custom stylesheet to override styles within
  narrative content.
* `HOTSPOT_PATH_ROUTES`: Provides a means of specifying custom path routing rules. 
  These can be used to disallow requests that would otherwise render hotspot to be 
  non-performant. For example, when receiving a request at `<FHIR_ENDPOINT>/CodeSystem` 
  you may want to redirect the client to a URL that limits the amount of data that 
  would otherwise be returned (--> `<FHIR_ENDPOINT>/CodeSystem?_elements=id,name,status`).
  Another common example would be to strip the `_format` parameter 
  (eg. `<FHIR_ENDPOINT>/metadata?_format=xml` --> `<FHIR_ENDPOINT>/metadata`).
  When provided with a location, with a pathname that matches a rule in the pathRoute 
  config, the corresponding rule is applied to the redirect URL.
  _**NOTE:** 'matchPattern' supports regex_  
  **Actions that can be applied to a match include:**
    * **addSuffix**: Append a suffix to the provided pathname (NOTE: it will add a slash between the existing path and suffix)
    * **removeParams**: If the provided query string contains a parameter listed in 'removeParams', it will be removed from the redirect query string
    * **addParams**: If the provided query string does not contain the params defined in "addParams", they will be added to the redirect query string

##### Example Docker Compose file

```
version: "3"

services:
  polecat:
    image: hotspot
    ports:
      - "80:80"
    environment:
      HOTSPOT_FHIR_SERVER: https://ontoserver.csiro.au/stu3-latest
      HOTSPOT_FHIR_VERSION: 3.0.1
      HOTSPOT_NARRATIVE_STYLES: /agency-narrative.css
      HOTSPOT_PATH_ROUTES: "[{ 'matchPattern': '.*', 'removeParams': [ '_format' ] }]"
```

##### Example ${HOTSPOT_PATH_ROUTES} configuration
```
[
    {
      "matchPattern": ".*",
      "removeParams": [
        "_format"
      ]
    },
    {
      "matchPattern": "^[/]*$",
      "addSuffix": "metadata"
    },
    {
      "matchPattern": "/CodeSystem[/]*$",
      "addParams": {
        "_elements": [
          "resourceType",
          "id",
          "meta",
          "url",
          "identifier",
          "version",
          "name",
          "status",
          "experimental",
          "date",
          "publisher",
          "description",
          "author",
          "copyright",
          "text",
          "caseSensitive",
          "valueSet",
          "hierarchyMeaning",
          "compositional",
          "versionNeeded",
          "content",
          "filter",
          "property"
        ]
      }
    }
  ]
```

#### Roadmap

* Pagination of ValueSet expansions and Bundle entries.
* Rendering of Parameters resources.
* Support for Image References (http://hl7.org/fhir/STU3/narrative.html#id).

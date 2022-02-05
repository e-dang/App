## Dependencies

- Nodejs
- Docker
- Kubectl
- Helm
- Flux
- Pulumi
- Telepresence
- GnuPG2.2
- SOPS
- Pre-Commit
- Python3

## Style Conventions

### File Naming

- Use dashes ("-") for spaces.

### Response

- Payload data is stored under "data" property.
- IDs in the payload should be marked with "Id". For example, {"owner": "1"} is not allowed and should instead be {"ownerId": "1"}.
- URLs in the payload should be marked with "Url". For example, {"owner": "https://example.com"} is not allowed and should instead be {"ownerUrl": "https://example.com"}.
- In general, if the value of a property in the payload is an object, then the name of the property should be the name of the type the object represents. If value of the property is a single value taken from some object, then the property name should be the name of the type the object represents concatenated with the name of the property on the type. Examples of this are described above with ID and URL properties.

## Testing Conventions

### Unit Tests

#### Backend

- Mocks all dependencies
- Does not interact with the database as this should be mocked
- Tests are ran in-process
- Does not require configuration as this should be mocked
- Can be ran on localhost or in docker container
- Service under test does not need to be deployed to cluster

#### Frontend

- Tests are ran in-process
- Can be ran on localhost or in docker container

### Integration Tests

#### Backend

- Mocks out network calls to other microservices
- Interacts with the database
- Database is thrown away at the end of all tests
- Requires configuration (could be same as dev config)
- Tests are ran in-process
- Can be ran on localhost or in docker container
- Service under test does not need to be deployed to cluster

#### Frontend

- Tests are ran in-process
- Can be ran on localhost or in docker container

### End to End Tests

#### Backend

- Service under test does need to be deployed to cluster
- Tests are ran out-of-process
- Can be ran on localhost or in docker container

#### Frontend

- Service under test does need to be deployed to cluster
- Tests are ran out-of-process
- Can be ran on localhost or in docker container

## Notes

### SOPS

- Need to generate pgp keys with gnupg2.2 because key generation with gnupg2.3 is not compatible with decryption when
  using gnupg2.2 with SOPS (as is done in Github Actions). However, encryption can be done with either version once
  the key has been generated.

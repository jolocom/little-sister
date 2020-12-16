import React from 'react'
import {
  Props as CredentialOverviewProps,
  CredentialOverview,
} from 'src/ui/home/components/credentialOverview'
import { shallow } from 'enzyme'

// TODO Is this running?
describe('CredentialsOverview component', () => {
  const COMMON_PROPS: CredentialOverviewProps = {
    onEdit: jest.fn(),
    did: 'did:jolo:test',
    claimsToRender: {
      Personal: [
        {
          credentialType: 'Name',
          claimData: {
            givenName: 'Hello',
            familyName: 'World',
          },
          id: 'claimTestId#1',
          issuer: {
            did: 'did:jolo:test',
          },
          subject: 'did:jolo:test',
        },
      ],
      Contact: [
        {
          credentialType: 'Email',
          claimData: {
            email: 'test@test.de',
          },
          id: 'claimTestId#2',
          issuer: {
            did: 'did:jolo:test',
            publicProfile: {
              image: 'https://test.com/image.png',
              name: 'Test',
              description: 'Test description',
            },
          },
          subject: 'did:jolo:test',
        },
        {
          credentialType: 'Phone',
          claimData: {
            telephone: '999111',
          },
          id: 'claimTestId#3',
          issuer: {
            did: 'did:jolo:test',
          },
          subject: 'did:jolo:test',
        },
      ],
    },
  }

  it('matches the snapshot on render', () => {
    const rendered = shallow(<CredentialOverview {...COMMON_PROPS} />)
    expect(rendered).toMatchSnapshot()
  })
})

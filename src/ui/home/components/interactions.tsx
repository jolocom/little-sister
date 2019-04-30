import React from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import I18n from 'src/locales/i18n'
import { SectionClaimCard, ClaimCard } from 'src/ui/structure/claimCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {}

interface Document {
  details: {
    type: string
    id_number: string
  }
  valid_until: Date | undefined
  issuer: string
}

interface DocumentCardProps {
  document: Document
}

const demoDocuments: Document[] = [
  {
    issuer: 'did:jolo:aa1bb2cc3dd4',
    details: {
      id_number: 'T3ST0001',
      type: 'A-kaart',
    },
    valid_until: new Date(Date.parse('2020-04-29')),
  },
]

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    height: 26,
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
    color: 'grey',
    paddingHorizontal: 16,
  },
  issuedByContainer: {
    marginBottom: 0,
    padding: 20,
  },
})

const debug = {
  // borderColor: 'red',
  // borderWidth: 1,
}

const documentCardStyles = StyleSheet.create({
  container: {
    ...debug,
    padding: 20,
    width: '100%',
  },
  card: {
    ...debug,
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    padding: 15,
  },
  documentType: {
    fontSize: 28,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  documentNumber: {
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  validity: {
    flexDirection: 'row',
    color: 'red',
    marginTop: 20,
  },
})

export const DocumentCard: React.SFC<DocumentCardProps> = props => (
  <View style={documentCardStyles.container}>
    <View style={documentCardStyles.card}>
      <Text style={documentCardStyles.documentType}>
        {props.document.details.type}
      </Text>
      <Text style={documentCardStyles.documentNumber}>
        {props.document.details.id_number}
      </Text>
      <View style={documentCardStyles.validity}>
        <Icon size={15} name="check-all" />
        {props.document.valid_until && (
          <Text>
            Valid until {props.document.valid_until.toLocaleDateString('en-GB')}
          </Text>
        )}
      </View>
    </View>
  </View>
)

export class InteractionsComponent extends React.Component<Props> {
  render() {
    return (
      <View style={styles.mainContainer}>
        <DocumentCard document={demoDocuments[0]} />
        <ScrollView style={{ width: '100%' }}>
          <Text style={styles.sectionHeader}>Issued by</Text>
          {/* Make new component for this? */}
          <SectionClaimCard
            title=""
            primaryText={demoDocuments[0].issuer}
            secondaryText="https://www.theissuer.com"
            leftIcon={
              <Icon size={20} name="account-card-details" color="grey" />
            }
            rightIcon={<Icon size={20} name="chevron-down" color="grey" />}
          />
          <Text style={styles.sectionHeader}>Details</Text>
          {/* Make titles dependent on something else, light grey instead of black */}
          {Object.keys(demoDocuments[0].details).map(key => (
            <SectionClaimCard
              title={key}
              primaryText={demoDocuments[0].details[key]}
              leftIcon={
                <Icon size={20} name="checkbox-blank" color="lightgrey" />
              }
            />
          ))}
        </ScrollView>
      </View>
    )
  }
}

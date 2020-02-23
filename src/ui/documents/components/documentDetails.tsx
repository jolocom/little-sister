import React from 'react'
import { View, Text, StyleSheet, Linking } from 'react-native'
import { IssuerCard } from 'src/ui/documents/components/issuerCard'
import { DecoratedClaims } from 'src/reducers/account'
import { prepareLabel } from 'src/lib/util'
import { Typography, Colors, Spacing } from 'src/styles'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AppError, ErrorCode } from 'src/lib/errors'

interface Props {
  document: DecoratedClaims
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.XXL,
  },
  sectionHeader: {
    ...Typography.sectionHeader,
    marginTop: Spacing.LG,
    marginBottom: Spacing.SM,
    paddingHorizontal: Spacing.MD,
  },
  claimsContainer: {
    borderColor: Colors.lightGrey,
    borderTopWidth: 1,
  },
  claimCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.lightGrey,
    paddingVertical: Spacing.MD,
    borderBottomWidth: 1,
  },
  claimCardTextContainer: {
    paddingHorizontal: Spacing.XL,
  },
  claimCardActionContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  claimCardTitle: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    color: Colors.blackMain040,
  },
  claimCardData: {
    ...Typography.standardText,
    color: Colors.blackMain,
  },
})

export const DocumentDetailsComponent: React.FC<Props> = ({ document }) => {
  if (!document) return null

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Issued by</Text>
      <IssuerCard issuer={document.issuer} />
      <Text style={styles.sectionHeader}>
        {I18n.t(strings.DOCUMENT_DETAILS_CLAIMS)}
      </Text>
      <View style={styles.claimsContainer}>
        {Object.keys(document.claimData).map(key => {
          let val = document.claimData[key]
          if (!val) return null
          let ret
          if (key !== 'actions') {
            ret = (
              <View style={styles.claimCardTextContainer}>
                <Text style={styles.claimCardTitle}>{prepareLabel(key)}</Text>
                <Text style={styles.claimCardData}>{val}</Text>
              </View>
            )
          } else if (key === 'actions') {
            let actions
            try {
              actions = JSON.parse(val)
            } catch (err) {
              if (!(err instanceof SyntaxError)) {
                throw err
              }
            }

            if (actions && actions.length > 0) {
              const action = actions[0]
              ret = (
                  <View
                    onTouchEnd={() => doAction(action)}
                    style={styles.claimCardActionContainer}
                  >
                    <Icon
                      style={{ marginRight: 18 }}
                      size={24}
                      name={'play'}
                      color={Colors.blackMain}
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.claimCardTitle}>{action.name}</Text>
                      <Text style={styles.claimCardData}>{action.description}</Text>
                    </View>
                </View>
              )
            }
          }

          return ret ? (
            <View key={key} style={styles.claimCard}>
              {ret}
            </View>
          ) : null
        })
      }
      </View>
    </View>
  )
}

const doAction = async (action: any) => {
  console.log('doing action', action)
  if (!(await Linking.canOpenURL(action.url))) {
    throw new AppError(ErrorCode.DeepLinkUrlNotFound)
  }
  console.log('linking openUrl', action.url)
  return Linking.openURL(action.url)
}


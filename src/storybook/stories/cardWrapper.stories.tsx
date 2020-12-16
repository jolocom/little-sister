import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { CardWrapper, Wrapper } from 'src/ui/structure'
import { StyleSheet, View, Text } from 'react-native'
import { Spacing, Typography, Colors } from 'src/styles'
import { getCredentialIconByType } from 'src/resources/util'

const styles = StyleSheet.create({
  greyBg: {
    backgroundColor: Colors.backgroundLightMain,
  },
  cardVerticalBorders: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  claimsArea: {
    flex: 1,
    marginLeft: Spacing.MD,
  },
  claimLabel: {
    ...Typography.cardSecondaryText,
  },
  claimText: {
    ...Typography.cardMainText,
    marginBottom: Spacing.XXS,
  },
  leftIconSection: {
    paddingHorizontal: Spacing.XS,
  },
})

storiesOf('CardWrapper usage', module)
  .add('as a credentialCard with no leftIcon', () => (
    <Wrapper style={styles.greyBg}>
      <CardWrapper style={styles.cardVerticalBorders}>
        <View style={styles.claimsArea}>
          <Text style={styles.claimLabel}>Claim Label</Text>
          <Text style={styles.claimText}>Claim Text</Text>
        </View>
      </CardWrapper>
    </Wrapper>
  ))
  .add('as a credentialCard with multiple claims and no icon', () => (
    <Wrapper style={styles.greyBg}>
      <CardWrapper style={styles.cardVerticalBorders}>
        <View style={styles.claimsArea}>
          <Text style={styles.claimLabel}>Label 1</Text>
          <Text style={styles.claimText}>Claim Text</Text>
          <Text style={styles.claimLabel}>Label 2</Text>
          <Text style={styles.claimText}>Claim Text</Text>
          <Text style={styles.claimLabel}>Label 3</Text>
          <Text style={styles.claimText}>Claim Text</Text>
        </View>
      </CardWrapper>
    </Wrapper>
  ))
  .add('as a credentialCard with multiple claims and no icon', () => (
    <Wrapper style={styles.greyBg}>
      <CardWrapper style={styles.cardVerticalBorders}>
        <View style={styles.claimsArea}>
          <Text style={styles.claimLabel}>Label 1</Text>
          <Text style={styles.claimText}>Claim Text</Text>
          <Text style={styles.claimLabel}>Label 2</Text>
          <Text style={styles.claimText}>Claim Text</Text>
          <Text style={styles.claimLabel}>Label 3</Text>
          <Text style={styles.claimText}>Claim Text</Text>
        </View>
      </CardWrapper>
    </Wrapper>
  ))
  .add('as a credentialCard with multiple claims with leftIcon', () => (
    <Wrapper style={styles.greyBg}>
      <CardWrapper style={styles.cardVerticalBorders}>
        <View style={styles.leftIconSection}>
          {getCredentialIconByType('Name')}
        </View>
        <View style={styles.claimsArea}>
          <Text style={styles.claimLabel}>Label 1</Text>
          <Text style={styles.claimText}>Claim Text</Text>
          <Text style={styles.claimLabel}>Label 2</Text>
          <Text style={styles.claimText}>Claim Text</Text>
          <Text style={styles.claimLabel}>Label 3</Text>
          <Text style={styles.claimText}>Claim Text</Text>
        </View>
      </CardWrapper>
    </Wrapper>
  ))

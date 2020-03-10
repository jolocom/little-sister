export enum CredentialTypes {
  Email = 'Email',
  MobilePhone = 'Mobile Phone',
  Name = 'Name',
  PostalAddress = 'Postal Address',
}

export enum Categories {
  Personal = 'Personal',
  Contact = 'Contact',
  Other = 'Other',
}

export const uiCredentialTypeByType: { [key: string]: string } = {
  ProofOfEmailCredential: CredentialTypes.Email,
  ProofOfMobilePhoneNumberCredential: CredentialTypes.MobilePhone,
  ProofOfNameCredential: CredentialTypes.Name,
  ProofOfPostalAddressCredential: CredentialTypes.PostalAddress,
}

export const uiCredentialFromType = (type: string) => {
  const uiType = uiCredentialTypeByType[type]
  return uiType ? uiType : type
}

export const localCredentialTypes = Object.keys(uiCredentialTypeByType)

export const uiCategoryByCredentialType: { [key: string]: string[] } = {
  Contact: [
    CredentialTypes.Email,
    CredentialTypes.MobilePhone,
    CredentialTypes.PostalAddress,
  ],
  Personal: [CredentialTypes.Name],
}

export const defaultUiCategories = Object.keys(uiCategoryByCredentialType)

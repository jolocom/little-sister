import React from 'react'
import Radium from 'radium'

import {theme} from 'styles'

const STYLES = {
  header: {
    margin: '62px 16px 16px 16px'
  },
  title: {
    color: theme.textStyles.headline.color,
    fontSize: theme.textStyles.headline.fontSize,
    fontWeight: theme.textStyles.headline.fontWeight,
    margin: 0,
    '@media screen and (min-width: 1200px)': {
      fontSize: '24pt'
    }
  }
}

const Header = ({image, title, style, children, ...props}) => {
  if (title) {
    title = <h1 style={STYLES.title}>{title}</h1>
  }

  return (
    <header style={Object.assign({}, STYLES.header, style)} {...props}>
      {image}
      {title}
      {children}
    </header>
  )
}

Header.propTypes = {
  image: React.PropTypes.any,
  title: React.PropTypes.string,
  children: React.PropTypes.any,
  style: React.PropTypes.object
}

export default Radium(Header)

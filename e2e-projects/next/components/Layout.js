import React from "react";
import Head from "next/head";
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, menu, title, footer, currentLocale, locales, alt_versions }) => {
  return (
    <div>
      <Head>
        <title> {title ? title : "Prismic Ecommerce Demo"} </title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      { menu?.data ?
        <Header menu={menu} currentLocale={currentLocale} locales={locales} alt_versions={alt_versions}/>
        : <span/>
      }
      <main>{children}</main>
      { footer?.data ?
        <Footer footer={footer}/>
        : <span/>
      }
    </div>
  )
};

export default Layout;
import React, { useState, useEffect, useRef } from "react";
import styles from "./CountryCodePicker.module.css";
import { RiArrowDownSLine } from "react-icons/ri";
import useClickOutside from "../useClickOutside";
import Image from "next/image";

const CountryCodePicker = ({
  choosenCountryCode,
  selectedCountry,
  setCountrySelected,
  optionThemeObj,
}) => {
  const [loading, setLoading] = useState(true);
  const [countryCodeArr, setCountryCodeArr] = useState([]);
  const [isCountryCodePickerClick, setIsCountryCodePickerClick] =
    useState(false);
  const [searchCountryText, setSearchCountryText] = useState("");
  const [countryListToShow, setCountryListToShow] = useState([]);
  const ignoresDropDownNode = useRef(null);
  const DropdownNode = useClickOutside(
    () => setIsCountryCodePickerClick(false),
    ignoresDropDownNode.current
  );

  //FETCH COUNTRYCODES

  const fetchCountryCode = async () => {
    try {
      const data = await fetch(
        "https://gist.githubusercontent.com/kcak11/4a2f22fb8422342b3b3daa7a1965f4e4/raw/2cc0fcb49258c667f1bc387cfebdfd3a00c4a3d5/countries.json"
      );
      const res = await data.json();
      setCountryCodeArr(res);
    } catch (error) {
      console.log("fetching countries", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCountryCode();
    return () => {
      setCountryCodeArr([]);
    };
  }, []);

  function filterCountriesByExactMatch(countries, searchWord) {
    return countries.filter((country) => {
      const lowercaseCountry = country.name.toLowerCase();
      const lowercaseSearchWord = searchWord.toLowerCase();

      if (lowercaseCountry.startsWith(lowercaseSearchWord)) {
        for (let i = 0; i < searchWord.length; i++) {
          if (lowercaseCountry[i] !== lowercaseSearchWord[i]) {
            return false;
          }
        }
        return true;
      }
      return false;
    });
  }

  //ON COUNTRY SEARCH
  useEffect(() => {
    if (searchCountryText === "") {
      setCountryListToShow(countryCodeArr);
      return;
    }

    const filteredCountry = filterCountriesByExactMatch(
      countryCodeArr,
      searchCountryText
    );
    setCountryListToShow(filteredCountry);
  }, [searchCountryText, countryCodeArr]);

  //ACCORDING TO USER CURRENT LOCATION SET COUNTRY CODE PICKER
  useEffect(() => {
    if (choosenCountryCode && countryCodeArr.length > 0) {
      const countryAccrodingToIp = countryCodeArr.filter((cc) => {
        return cc.isoCode === choosenCountryCode;
      });
      setCountrySelected(countryAccrodingToIp[0]);
    }
    //eslint-disable-next-line
  }, [choosenCountryCode, countryCodeArr]);

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsCountryCodePickerClick((p) => !p);
        }}
        className={styles.signup_form_onboarding_countryCode_selector_inputCont}
      >
        {selectedCountry && (
          <Image src={selectedCountry?.flag} alt="map" width={30} height={25} />
        )}
        <RiArrowDownSLine
          style={{
            marginLeft: ".25rem",
            fontSize: "1.1rem",
            color: optionThemeObj?.option_text_color,
          }}
        />
      </div>
      {isCountryCodePickerClick && (
        <div
          ref={DropdownNode}
          className={
            styles.signup_form_onboarding_countryCode_selector_inputCont_selector
          }
        >
          <input
            name="country"
            autoComplete="off"
            autoFocus
            className={
              styles.signup_form_onboarding_countryCode_selector_country_search_input
            }
            onChange={(e) => setSearchCountryText(e.target.value)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            type="text"
            placeholder="Search country"
            value={searchCountryText}
          />
          {countryListToShow.map((cc) => {
            return (
              <>
                <div
                  style={{
                    background:
                      selectedCountry.isoCode === cc.isoCode ? "#476A7E" : "",
                    color: selectedCountry.isoCode === cc.isoCode ? "#fff" : "",
                  }}
                  onClick={() => {
                    setIsCountryCodePickerClick(false);
                    setCountrySelected(cc);
                  }}
                  key={cc.isoCode}
                  className={
                    styles.signup_form_onboarding_countryCode_selector_inputCont_selector_option
                  }
                >
                  <Image src={cc?.flag} alt="map" width={30} height={25} />
                  <p style={{ marginLeft: ".5rem" }}>{cc.name}</p>
                  <p style={{ marginLeft: ".5rem" }}>{`(${cc.dialCode})`}</p>
                </div>
              </>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CountryCodePicker;

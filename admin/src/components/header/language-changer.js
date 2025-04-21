import { useTranslation } from 'react-i18next';
import 'assets/scss/components/header.scss';
import { useState } from 'react';
import LangModal from 'components/lang-modal';
import LangImagePath from 'assets/images/lang.png';
import { Image } from 'antd';

const LanguageChanger = () => {
  const { i18n } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  return (
    <div>
      <button
        type='button'
        className='languageChanger'
        onClick={() => setIsLanguageOpen(true)}
      >
        <Image
          src={LangImagePath}
          alt='lang'
          width={22}
          height={22}
          preview={false}
        />
        <span className='text'>{i18n.language}</span>
      </button>
      {isLanguageOpen && (
        <LangModal
          visible={isLanguageOpen}
          handleCancel={() => setIsLanguageOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageChanger;

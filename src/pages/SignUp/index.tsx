import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';

import useInput from '../../hooks/useInput';
import { Header, Form, Label, Input, Button, Error, Success, LinkContainer } from './style';

const SignUp: FC = () => {
  const [email, onChangeEmail] = useInput<string>('');
  const [nickname, onChangeNickname] = useInput<string>('');
  const [password, onChangePassword] = useInput<string>('');
  const [passwordCheck, onChangePasswordCheck] = useInput<string>('');

  const [mismatchError, setMismatchError] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState<boolean>(false);
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);

  const onSubmit = () => {};

  return (
    <div id='container'>
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id='email-label'>
          <span>이메일 주소</span>
          <div>
            <Input type='email' id='email' name='email' value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id='nickname-label'>
          <span>닉네임</span>
          <div>
            <Input type='text' id='nickname' name='nickname' value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id='password-label'>
          <span>비밀번호</span>
          <div>
            <Input type='password' id='password' name='password' value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id='password-check-label'>
          <span>비밀번호 확인</span>
          <div>
            <Input
              type='password'
              id='password-check'
              name='password-check'
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {!nickname && <Error>닉네임을 입력해 주세요.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입 되었습니다! 로그인해 주세요.</Success>}
        </Label>
        <Button type='submit'>회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to='/login'>로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default SignUp;

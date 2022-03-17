import React, { FC, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import useInput from '../../hooks/useInput';
import { Header, Form, Label, Input, Button, Error, Success, LinkContainer } from './style';

const SignUp: FC = () => {
  const [email, onChangeEmail] = useInput<string>('');
  const [nickname, onChangeNickname] = useInput<string>('');
  const [password, , setPassword] = useInput<string>('');
  const [passwordCheck, , setPasswordCheck] = useInput<string>('');

  const [signUpError, setSignUpError] = useState<string>('');
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);
  const [mismatchError, setMismatchError] = useState<boolean>(false);

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
      passwordCheck && setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck]
  );

  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password]
  );

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (nickname && !mismatchError) {
        try {
          setSignUpError('');
          setSignUpSuccess(false);

          await axios.post('/api/users', { email, nickname, password });

          confirm('회원가입이 완료되었습니다.');
          setSignUpSuccess(true);
        } catch (e: any) {
          setSignUpError(e.response.data);
          console.log(e.message);
        }
      }
    },
    [email, nickname, password, mismatchError]
  );

  return (
    <div id='container'>
      <Header>mySlack</Header>
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
          {signUpSuccess && <Success>회원가입이 완료되었습니다. 로그인 해주세요.</Success>}
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

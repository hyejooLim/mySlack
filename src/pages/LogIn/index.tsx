import React, { useCallback, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';

import useInput from '../../hooks/useInput';
import fetcher from '../../utils/fetcher';
import { Header, Form, Label, Input, Button, LinkContainer, Error } from '../SignUp/style';

const LogIn = () => {
  const { data, error, isValidating, mutate } = useSWR('/api/users', fetcher, {
    dedupingInterval: 100000,
  });

  const [email, onChangeEmail] = useInput<string>('');
  const [password, onChangePassword] = useInput<string>('');
  const [logInError, setLogInError] = useState<string>('');

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!logInError) {
        try {
          setLogInError('');

          await axios.post('/api/users/login', { email, password }, { withCredentials: true });
          mutate();

          confirm('로그인 되었습니다.');
        } catch (e: any) {
          setLogInError(e.response.data);
          console.log(e.message);
        }
      }
    },
    [logInError, email, password]
  );

  if (data === undefined) {
    return <div>Loading...</div>;
  }

  if (data) {
    return <Navigate to={'/workspace/channel'} />;
  }

  return (
    <div>
      <div id='container'>
        <Header>mySlack</Header>
        <Form onSubmit={onSubmit}>
          <Label id='email-label'>
            <span>이메일 주소</span>
            <div>
              <Input type='email' id='email' name='email' value={email} onChange={onChangeEmail} />
            </div>
          </Label>
          <Label id='password-label'>
            <span>비밀번호</span>
            <div>
              <Input type='password' id='password' name='password' value={password} onChange={onChangePassword} />
            </div>
            {logInError && <Error>{logInError}</Error>}
          </Label>
          <Button type='submit'>로그인</Button>
        </Form>
        <LinkContainer>
          아직 회원이 아니신가요?&nbsp;
          <Link to='/signup'>회원가입 하러가기</Link>
        </LinkContainer>
      </div>
    </div>
  );
};

export default LogIn;

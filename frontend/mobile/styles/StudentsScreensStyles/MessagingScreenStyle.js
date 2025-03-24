import styled from "styled-components/native";

export const MessageCardContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

export const ProfileImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 15px;
`;

export const MessageDetails = styled.View`
  flex: 1;
`;

export const UserName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #004d40;
`;

export const MessageText = styled.Text`
  font-size: 14px;
  color: #666;
`;

export const MessageInfo = styled.View`
  align-items: flex-end;
`;

export const UnreadBadge = styled.View`
  background-color: #004d40;
  width: 25px;
  height: 25px;
  border-radius: 12.5px;
  align-items: center;
  justify-content: center;
`;

export const UnreadText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-weight: bold;
`;

export const TimeText = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

export const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;

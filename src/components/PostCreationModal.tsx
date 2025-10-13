
import React, { useState } from 'react';
import { X, Mic, Type, Clock, Eye, Users, Lock, Info, MessageCircle, Music, MoreHorizontal } from 'lucide-react';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostCreationModal = ({ isOpen, onClose }: PostCreationModalProps) => {
  const [postType, setPostType] = useState<'text' | 'voice'>('text');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('1h');
  const [visibility, setVisibility] = useState('public');
  const [category, setCategory] = useState('social');
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (!isOpen) return null;

  const durationOptions = [
    { value: '1h', label: '1시간', available: true },
    { value: '6h', label: '6시간', available: true },
    { value: '12h', label: '12시간', available: true },
    { value: '24h', label: '24시간', available: false, level: 2 },
    { value: '48h', label: '48시간', available: false, level: 3 },
    { value: '72h', label: '72시간', available: false, level: 4 },
  ];

  const visibilityOptions = [
    { value: 'public', label: '공개', icon: Eye, desc: '모든 사용자' },
    { value: 'friends', label: '친구', icon: Users, desc: '친구들만' },
    { value: 'private', label: '비공개', icon: Lock, desc: '나만 보기' },
  ];

  const categoryOptions = [
    { value: 'info', label: '정보', icon: Info, color: 'text-blue-600' },
    { value: 'social', label: '소셜', icon: MessageCircle, color: 'text-red-600' },
    { value: 'nonverbal', label: '비언어', icon: Music, color: 'text-purple-600' },
    { value: 'other', label: '기타', icon: MoreHorizontal, color: 'text-green-600' },
  ];

  const handleSubmit = () => {
    // Handle post creation logic here
    console.log({
      postType,
      content,
      duration,
      visibility,
      category,
      isAnonymous
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-korean-xl font-bold text-gray-800">새 게시물</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post type selector */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 korean-text">게시물 형태</h3>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setPostType('text')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                  postType === 'text'
                    ? 'bg-white shadow-soft text-primary'
                    : 'text-gray-600'
                }`}
              >
                <Type className="w-4 h-4 mr-2" />
                <span className="text-sm korean-text">텍스트</span>
              </button>
              <button
                onClick={() => setPostType('voice')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                  postType === 'voice'
                    ? 'bg-white shadow-soft text-primary'
                    : 'text-gray-600'
                }`}
              >
                <Mic className="w-4 h-4 mr-2" />
                <span className="text-sm korean-text">음성</span>
              </button>
            </div>
          </div>

          {/* Content input */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 korean-text">내용</h3>
            {postType === 'text' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="무슨 일이 일어나고 있나요?"
                className="w-full p-4 border border-gray-200 rounded-xl resize-none korean-text focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={4}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 korean-text mb-4">음성 녹음하기</p>
                <button className="btn-primary">
                  녹음 시작
                </button>
              </div>
            )}
          </div>

          {/* Category selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 korean-text">카테고리</h3>
            <div className="post-type-grid">
              {categoryOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setCategory(option.value)}
                    className={`post-type-option ${category === option.value ? 'selected' : ''}`}
                  >
                    <IconComponent className={`w-5 h-5 mr-3 ${option.color}`} />
                    <span className="korean-text font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 korean-text">유지 시간</h3>
            <div className="duration-selector">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => option.available && setDuration(option.value)}
                  disabled={!option.available}
                  className={`duration-option ${duration === option.value ? 'selected' : ''} ${
                    !option.available ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-sm korean-text">{option.label}</span>
                  {!option.available && (
                    <span className="text-xs text-gray-400 mt-1">Lv.{option.level}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 korean-text">공개 범위</h3>
            <div className="visibility-grid">
              {visibilityOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    className={`visibility-option ${visibility === option.value ? 'selected' : ''}`}
                  >
                    <IconComponent className="w-5 h-5 mb-2" />
                    <span className="text-sm font-medium korean-text">{option.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{option.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anonymous option */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 korean-text">익명 게시</h3>
              <p className="text-xs text-gray-500 korean-text">작성자를 익명으로 표시</p>
            </div>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                isAnonymous ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  isAnonymous ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() && postType === 'text'}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed korean-text"
          >
            게시하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCreationModal;

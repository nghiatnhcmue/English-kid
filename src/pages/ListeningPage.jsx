import SkillPageLayout from '../components/layout/SkillPageLayout.jsx';
import ListeningStation from '../components/stations/ListeningStation.jsx';

export default function ListeningPage() {
  return (
    <SkillPageLayout
      title="👂 Phòng Luyện Nghe Hội Thoại SGK"
      subtitle={(n) =>
        `${n} bài hội thoại học đường SGK Global Success (Skills 2) · Có hỗ trợ nghe chậm 0.65x cho người mới học`
      }
      showBackToUnitAction
      tip={{
        tone: 'sky',
        icon: '💡',
        title: 'Mẹo luyện nghe tiếng Anh hiệu quả:',
        body: (
          <>
            Lần 1: Bấm nút loa lớn để nghe tự nhiên toàn đoạn. Lần 2: Bấm nút{' '}
            <strong>&quot;🐢 Nghe chậm (0.65x)&quot;</strong> để nghe rõ từng âm đuôi (ending sounds) và chọn đáp án
            trắc nghiệm nhé!
          </>
        ),
      }}
      navAriaLabel="Chọn bài học luyện nghe"
      navLabel={(n) => `Chọn bài học để luyện nghe (${n} bài học):`}
      pillTone="peach"
      Station={ListeningStation}
      mode="listenstation"
    />
  );
}
